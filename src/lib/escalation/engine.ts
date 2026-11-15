import {
  ScheduledDose,
  CaregiverAlert,
  NotificationItem,
  ActivityLog,
  PatientProfile,
  Medication,
} from "@/types";

export interface EscalationEvaluationResult {
  updatedDoses: ScheduledDose[];
  newAlerts: CaregiverAlert[];
  updatedAlerts: CaregiverAlert[];
  notifications: NotificationItem[];
  activityLogs: ActivityLog[];
}

/**
 * Evaluates all scheduled doses for a patient against current time and applies escalation rules.
 * Pure, deterministic business logic suitable for unit tests and production background worker.
 */
export function evaluateDosesAndEscalate(
  patient: PatientProfile,
  doses: ScheduledDose[],
  existingAlerts: CaregiverAlert[],
  currentTimeIso: string = new Date().toISOString()
): EscalationEvaluationResult {
  const result: EscalationEvaluationResult = {
    updatedDoses: [],
    newAlerts: [],
    updatedAlerts: [],
    notifications: [],
    activityLogs: [],
  };

  const currentTime = new Date(currentTimeIso).getTime();
  const gracePeriodMs = (patient.escalationSettings.gracePeriodMinutes || 15) * 60 * 1000;
  const escalationDelayMs = (patient.escalationSettings.escalationDelayMinutes || 15) * 60 * 1000;
  const escalationOrder = patient.escalationSettings.escalationOrder || [patient.primaryCaregiverId];

  // Map existing alerts by doseId for fast lookup
  const alertByDoseId = new Map<string, CaregiverAlert>();
  for (const alert of existingAlerts) {
    alertByDoseId.set(alert.doseId, alert);
  }

  for (const dose of doses) {
    // If dose is already taken or skipped, ensure any associated open alerts are marked resolved
    if (dose.status === "TAKEN" || dose.status === "SKIPPED") {
      const openAlert = alertByDoseId.get(dose.id);
      if (openAlert && openAlert.status !== "RESOLVED") {
        const resolvedAlert: CaregiverAlert = {
          ...openAlert,
          status: "RESOLVED",
          resolvedAt: currentTimeIso,
          resolutionReason: `Patient marked medication as ${dose.status.toLowerCase()} (${dose.confirmationType})`,
        };
        result.updatedAlerts.push(resolvedAlert);
        result.activityLogs.push({
          id: `log_alert_resolve_${openAlert.id}_${Date.now()}`,
          patientId: patient.id,
          userId: "system",
          userName: "CareLoop Escalation Engine",
          action: "RESOLVED_ALERT",
          details: `Escalation stopped for ${dose.medicationName}. Dose recorded as ${dose.status}.`,
          timestamp: currentTimeIso,
          category: "ALERT",
        });
      }
      continue;
    }

    const scheduledTime = new Date(dose.scheduledTime).getTime();
    const graceDeadline = dose.snoozedUntil
      ? new Date(dose.snoozedUntil).getTime() + gracePeriodMs
      : scheduledTime + gracePeriodMs;

    // 1. Initial Medication Reminder Generation (at or right after scheduled time, before grace deadline)
    if (
      dose.status === "PENDING" &&
      currentTime >= scheduledTime &&
      currentTime < graceDeadline &&
      dose.escalationLevel === 0
    ) {
      // Patient reminder
      result.notifications.push({
        id: `notif_due_${dose.id}_patient`,
        userId: patient.userId || patient.id,
        patientId: patient.id,
        title: `Medication Reminder: ${dose.medicationName}`,
        message: `It is time to take your prescribed dose of ${dose.medicationName} (${dose.dosage}). Please confirm once taken.`,
        type: "MEDICATION_DUE",
        referenceId: dose.id,
        read: false,
        deliveryStatus: "DELIVERED",
        createdAt: currentTimeIso,
      });

      const updatedDose: ScheduledDose = {
        ...dose,
        escalationLevel: 0,
        updatedAt: currentTimeIso,
      };
      result.updatedDoses.push(updatedDose);
    }

    // Check if dose is snoozed and snooze period is still active
    if (dose.status === "SNOOZED" && dose.snoozedUntil) {
      const snoozeUntilTime = new Date(dose.snoozedUntil).getTime();
      if (currentTime < snoozeUntilTime) {
        // Still snoozed, do not escalate yet
        continue;
      }
      // Snooze expired! Reset to PENDING so escalation checks resume
      dose.status = "PENDING";
    }

    // 2. Stage 1: Grace Period Exceeded -> Alert Primary Caregiver
    if (
      dose.status === "PENDING" &&
      currentTime >= graceDeadline &&
      !dose.caregiverAlertGenerated
    ) {
      const primaryCaregiverId = escalationOrder[0] || patient.primaryCaregiverId;
      const alertId = `alert_${dose.id}_lvl1`;

      const newAlert: CaregiverAlert = {
        id: alertId,
        patientId: patient.id,
        doseId: dose.id,
        medicationName: dose.medicationName,
        dosage: dose.dosage,
        scheduledTime: dose.scheduledTime,
        severity: "HIGH",
        status: "PENDING",
        acknowledged: false,
        escalatedToUserIds: [primaryCaregiverId],
        currentEscalationIndex: 0,
        lastEscalatedAt: currentTimeIso,
        createdAt: currentTimeIso,
      };

      result.newAlerts.push(newAlert);
      alertByDoseId.set(dose.id, newAlert);

      // Notification to primary caregiver
      result.notifications.push({
        id: `notif_alert_${dose.id}_caregiver`,
        userId: primaryCaregiverId,
        patientId: patient.id,
        title: `Missed Medication Alert: ${patient.fullName}`,
        message: `${patient.fullName} has not confirmed taking ${dose.medicationName} (${dose.dosage}) scheduled for ${new Date(dose.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Grace period expired.`,
        type: "CAREGIVER_ALERT",
        referenceId: alertId,
        read: false,
        deliveryStatus: "DELIVERED",
        createdAt: currentTimeIso,
      });

      const updatedDose: ScheduledDose = {
        ...dose,
        status: "MISSED",
        caregiverAlertGenerated: true,
        caregiverAlertId: alertId,
        escalationLevel: 1,
        updatedAt: currentTimeIso,
      };
      result.updatedDoses.push(updatedDose);

      result.activityLogs.push({
        id: `log_alert_gen_${alertId}_${Date.now()}`,
        patientId: patient.id,
        userId: "system",
        userName: "CareLoop Escalation Engine",
        action: "GENERATED_CAREGIVER_ALERT",
        details: `Generated level 1 missed medication alert for ${patient.fullName} (${dose.medicationName}). Alerted primary caregiver.`,
        timestamp: currentTimeIso,
        category: "ALERT",
      });
    }

    // 3. Stage 2+: Escalation to next authorized family member if unacknowledged
    const activeAlert = alertByDoseId.get(dose.id);
    if (
      activeAlert &&
      !activeAlert.acknowledged &&
      activeAlert.status !== "RESOLVED"
    ) {
      const lastEscalatedTime = new Date(activeAlert.lastEscalatedAt).getTime();
      const nextEscalationDeadline = lastEscalatedTime + escalationDelayMs;

      if (currentTime >= nextEscalationDeadline) {
        const nextIndex = activeAlert.currentEscalationIndex + 1;

        if (nextIndex < escalationOrder.length) {
          const nextUserId = escalationOrder[nextIndex];

          // Check if already escalated to this user to guarantee idempotency
          if (!activeAlert.escalatedToUserIds.includes(nextUserId)) {
            const updatedAlert: CaregiverAlert = {
              ...activeAlert,
              status: "ESCALATED",
              currentEscalationIndex: nextIndex,
              escalatedToUserIds: [...activeAlert.escalatedToUserIds, nextUserId],
              lastEscalatedAt: currentTimeIso,
            };

            result.updatedAlerts.push(updatedAlert);
            alertByDoseId.set(dose.id, updatedAlert);

            // Escalation notification to family member
            result.notifications.push({
              id: `notif_esc_${dose.id}_user_${nextUserId}`,
              userId: nextUserId,
              patientId: patient.id,
              title: `URGENT: Escalated Medication Alert for ${patient.fullName}`,
              message: `Previous caregiver alert for ${patient.fullName}'s medication (${dose.medicationName}) went unacknowledged. Escalated to you per family care protocol.`,
              type: "ALERT_ESCALATION",
              referenceId: activeAlert.id,
              read: false,
              deliveryStatus: "DELIVERED",
              createdAt: currentTimeIso,
            });

            // Update dose escalation level
            const updatedDose: ScheduledDose = {
              ...dose,
              escalationLevel: nextIndex + 1,
              updatedAt: currentTimeIso,
            };
            result.updatedDoses.push(updatedDose);

            result.activityLogs.push({
              id: `log_alert_esc_${activeAlert.id}_lvl${nextIndex + 1}_${Date.now()}`,
              patientId: patient.id,
              userId: "system",
              userName: "CareLoop Escalation Engine",
              action: "ESCALATED_ALERT",
              details: `Escalated alert for ${patient.fullName} (${dose.medicationName}) to family member level ${nextIndex + 1}.`,
              timestamp: currentTimeIso,
              category: "ALERT",
            });
          }
        }
      }
    }
  }

  return result;
}

/**
 * Generates today's scheduled doses from active medications for a given patient.
 * Prevents duplicates by deterministic ID: dose_{medId}_{dateStr}_{timeClean}
 */
export function generateDailyDoses(
  patientId: string,
  medications: Medication[],
  targetDate: Date = new Date(),
  gracePeriodMinutes: number = 15
): ScheduledDose[] {
  const doses: ScheduledDose[] = [];
  const dateStr = targetDate.toISOString().slice(0, 10);
  const dayOfWeek = targetDate.getDay(); // 0 = Sun, ... 6 = Sat

  for (const med of medications) {
    if (!med.isActive) continue;

    // Check start and end dates
    if (med.startDate && dateStr < med.startDate) continue;
    if (med.endDate && dateStr > med.endDate) continue;

    // Check if today is selected
    if (!med.selectedDays.includes(dayOfWeek)) continue;

    for (const time of med.scheduledTimes) {
      const timeClean = time.replace(":", "");
      const doseId = `dose_${med.id}_${dateStr}_${timeClean}`;
      const scheduledIso = `${dateStr}T${time}:00.000Z`;

      const schedTimeMs = new Date(scheduledIso).getTime();
      const graceMs = gracePeriodMinutes * 60 * 1000;
      const graceIso = new Date(schedTimeMs + graceMs).toISOString();

      doses.push({
        id: doseId,
        medicationId: med.id,
        patientId,
        medicationName: med.name,
        dosage: med.dosage,
        scheduledTime: scheduledIso,
        gracePeriodDeadline: graceIso,
        status: "PENDING",
        confirmationType: "NONE",
        snoozeCount: 0,
        caregiverAlertGenerated: false,
        escalationLevel: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return doses;
}
