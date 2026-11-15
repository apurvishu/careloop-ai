import {
  UserProfile,
  PatientProfile,
  PatientMembership,
  Medication,
  ScheduledDose,
  CaregiverAlert,
  Appointment,
  NotificationItem,
  Invitation,
  EmergencyProfile,
  ActivityLog,
  AICareSummary,
  UserRole,
} from "@/types";
import { mockStore } from "./mock-store";
import { isFirebaseConfigured, getClientApp } from "@/lib/firebase/config";
import { isFirebaseAdminConfigured, getAdminApp } from "@/lib/firebase/admin";

export class DatabaseService {
  // Users
  public async getUser(userId: string): Promise<UserProfile | null> {
    return mockStore.getDocument("users", userId);
  }

  public async saveUser(user: UserProfile): Promise<UserProfile> {
    mockStore.setDocument("users", user.id, user);
    return user;
  }

  // Patients
  public async getPatient(patientId: string): Promise<PatientProfile | null> {
    return mockStore.getDocument("patients", patientId);
  }

  public async savePatient(patient: PatientProfile): Promise<PatientProfile> {
    mockStore.setDocument("patients", patient.id, patient);
    return patient;
  }

  public async getPatientMemberships(patientId: string): Promise<PatientMembership[]> {
    const all = mockStore.getCollection("patientMemberships");
    return Object.values(all).filter((m) => m.patientId === patientId);
  }

  public async getUserMemberships(userId: string): Promise<PatientMembership[]> {
    const all = mockStore.getCollection("patientMemberships");
    return Object.values(all).filter((m) => m.userId === userId);
  }

  // Medications
  public async getMedications(patientId: string): Promise<Medication[]> {
    const all = mockStore.getCollection("medications");
    return Object.values(all).filter((m) => m.patientId === patientId);
  }

  public async getMedicationById(id: string): Promise<Medication | null> {
    return mockStore.getDocument("medications", id);
  }

  public async createMedication(
    patientId: string,
    data: Omit<Medication, "id" | "patientId" | "createdAt" | "updatedAt">
  ): Promise<Medication> {
    const id = `med_${Date.now()}`;
    const now = new Date().toISOString();
    const medication: Medication = {
      ...data,
      id,
      patientId,
      createdAt: now,
      updatedAt: now,
    };
    mockStore.setDocument("medications", id, medication);

    await this.logActivity(
      patientId,
      "system",
      "Caregiver",
      "ADDED_MEDICATION",
      `Added new medication: ${medication.name} (${medication.dosage})`,
      "MEDICATION"
    );

    return medication;
  }

  public async updateMedication(
    id: string,
    updates: Partial<Medication>
  ): Promise<Medication> {
    const updated = mockStore.updateDocument("medications", id, updates);
    if (updated) {
      await this.logActivity(
        updated.patientId,
        "system",
        "Caregiver",
        "UPDATED_MEDICATION",
        `Updated medication schedule for: ${updated.name}`,
        "MEDICATION"
      );
    }
    return updated;
  }

  public async archiveMedication(id: string): Promise<Medication> {
    return this.updateMedication(id, { isActive: false });
  }

  public async deleteMedication(id: string): Promise<boolean> {
    const med = await this.getMedicationById(id);
    if (med) {
      mockStore.deleteDocument("medications", id);
      await this.logActivity(
        med.patientId,
        "system",
        "Caregiver",
        "DELETED_MEDICATION",
        `Removed medication: ${med.name}`,
        "MEDICATION"
      );
      return true;
    }
    return false;
  }

  // Scheduled Doses
  public async getDoses(patientId: string): Promise<ScheduledDose[]> {
    const all = mockStore.getCollection("scheduledDoses");
    return Object.values(all)
      .filter((d) => d.patientId === patientId)
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }

  public async getDoseById(doseId: string): Promise<ScheduledDose | null> {
    return mockStore.getDocument("scheduledDoses", doseId);
  }

  public async saveDose(dose: ScheduledDose): Promise<ScheduledDose> {
    mockStore.setDocument("scheduledDoses", dose.id, dose);
    return dose;
  }

  public async markDoseTaken(
    doseId: string,
    userId: string,
    confirmationType: "SELF_REPORTED" | "VERIFIED" = "SELF_REPORTED"
  ): Promise<ScheduledDose> {
    const dose = await this.getDoseById(doseId);
    if (!dose) throw new Error("Dose not found");

    const now = new Date().toISOString();
    const updatedDose: ScheduledDose = {
      ...dose,
      status: "TAKEN",
      confirmationType,
      takenAt: now,
      takenByUserId: userId,
      updatedAt: now,
    };
    mockStore.setDocument("scheduledDoses", doseId, updatedDose);

    // If an alert was open for this dose, resolve it automatically
    const allAlerts = Object.values(mockStore.getCollection("caregiverAlerts"));
    const relatedAlert = allAlerts.find((a) => a.doseId === doseId && a.status !== "RESOLVED");
    if (relatedAlert) {
      mockStore.updateDocument("caregiverAlerts", relatedAlert.id, {
        status: "RESOLVED",
        resolvedAt: now,
        resolutionReason: `Patient marked medication as taken (${confirmationType})`,
      });
    }

    await this.logActivity(
      dose.patientId,
      userId,
      "Patient",
      "CONFIRMED_DOSE",
      `Confirmed taking ${dose.medicationName} (${dose.dosage}) [${confirmationType}]`,
      "MEDICATION"
    );

    return updatedDose;
  }

  public async snoozeDose(
    doseId: string,
    userId: string,
    minutes: number = 15
  ): Promise<ScheduledDose> {
    const dose = await this.getDoseById(doseId);
    if (!dose) throw new Error("Dose not found");

    const nowMs = Date.now();
    const snoozedUntil = new Date(nowMs + minutes * 60 * 1000).toISOString();
    const updatedDose: ScheduledDose = {
      ...dose,
      status: "SNOOZED",
      snoozedUntil,
      snoozeCount: (dose.snoozeCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    mockStore.setDocument("scheduledDoses", doseId, updatedDose);

    await this.logActivity(
      dose.patientId,
      userId,
      "Patient",
      "SNOOZED_REMINDER",
      `Snoozed ${dose.medicationName} for ${minutes} minutes (Snooze count: ${updatedDose.snoozeCount})`,
      "MEDICATION"
    );

    return updatedDose;
  }

  public async skipDose(
    doseId: string,
    userId: string,
    reason?: string
  ): Promise<ScheduledDose> {
    const dose = await this.getDoseById(doseId);
    if (!dose) throw new Error("Dose not found");

    const now = new Date().toISOString();
    const updatedDose: ScheduledDose = {
      ...dose,
      status: "SKIPPED",
      skipReason: reason || "User opted to skip dose",
      updatedAt: now,
    };
    mockStore.setDocument("scheduledDoses", doseId, updatedDose);

    await this.logActivity(
      dose.patientId,
      userId,
      "Patient",
      "SKIPPED_DOSE",
      `Skipped dose of ${dose.medicationName}. Reason: ${reason || "None specified"}`,
      "MEDICATION"
    );

    return updatedDose;
  }

  public async reportUnableToTake(
    doseId: string,
    userId: string,
    reason: string
  ): Promise<ScheduledDose> {
    const dose = await this.getDoseById(doseId);
    if (!dose) throw new Error("Dose not found");

    const now = new Date().toISOString();
    const updatedDose: ScheduledDose = {
      ...dose,
      status: "MISSED",
      unableToTakeReason: reason,
      updatedAt: now,
    };
    mockStore.setDocument("scheduledDoses", doseId, updatedDose);

    // Create an immediate high-priority alert for the caregiver
    const alertId = `alert_unable_${doseId}_${Date.now()}`;
    const alert: CaregiverAlert = {
      id: alertId,
      patientId: dose.patientId,
      doseId: dose.id,
      medicationName: dose.medicationName,
      dosage: dose.dosage,
      scheduledTime: dose.scheduledTime,
      severity: "CRITICAL",
      status: "PENDING",
      acknowledged: false,
      escalatedToUserIds: [],
      currentEscalationIndex: 0,
      lastEscalatedAt: now,
      createdAt: now,
    };
    mockStore.setDocument("caregiverAlerts", alertId, alert);

    await this.logActivity(
      dose.patientId,
      userId,
      "Patient",
      "REPORTED_UNABLE_TO_TAKE",
      `Patient reported unable to take ${dose.medicationName}. Reason: ${reason}`,
      "MEDICATION"
    );

    return updatedDose;
  }

  // Alerts
  public async getAlerts(patientId: string): Promise<CaregiverAlert[]> {
    const all = mockStore.getCollection("caregiverAlerts");
    return Object.values(all)
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public async acknowledgeAlert(
    alertId: string,
    caregiverId: string,
    notes?: string
  ): Promise<CaregiverAlert> {
    const alert = mockStore.getDocument("caregiverAlerts", alertId);
    if (!alert) throw new Error("Alert not found");

    const now = new Date().toISOString();
    // CRITICAL BUSINESS RULE:
    // Caregiver acknowledgment does NOT automatically mark medicine as taken!
    // It updates the alert acknowledgment status so family escalation halts, but keeps dose verification intact.
    const updatedAlert: CaregiverAlert = {
      ...alert,
      acknowledged: true,
      acknowledgedBy: caregiverId,
      acknowledgedAt: now,
      acknowledgmentNotes: notes || "",
      status: "ACKNOWLEDGED",
    };
    mockStore.setDocument("caregiverAlerts", alertId, updatedAlert);

    await this.logActivity(
      alert.patientId,
      caregiverId,
      "Caregiver",
      "ACKNOWLEDGED_ALERT",
      `Caregiver acknowledged missed dose alert for ${alert.medicationName}. (Note: Medicine not marked as taken until patient confirmation). Notes: ${notes || "None"}`,
      "ALERT"
    );

    return updatedAlert;
  }

  // Appointments
  public async getAppointments(patientId: string): Promise<Appointment[]> {
    const all = mockStore.getCollection("appointments");
    return Object.values(all)
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));
  }

  public async createAppointment(
    patientId: string,
    data: Omit<Appointment, "id" | "patientId" | "createdAt" | "updatedAt">
  ): Promise<Appointment> {
    const id = `apt_${Date.now()}`;
    const now = new Date().toISOString();
    const appointment: Appointment = {
      ...data,
      id,
      patientId,
      createdAt: now,
      updatedAt: now,
    };
    mockStore.setDocument("appointments", id, appointment);

    await this.logActivity(
      patientId,
      "system",
      "Caregiver",
      "SCHEDULED_APPOINTMENT",
      `Scheduled visit with ${appointment.doctorName} for ${appointment.appointmentDate} at ${appointment.appointmentTime}`,
      "APPOINTMENT"
    );

    return appointment;
  }

  public async updateAppointment(
    id: string,
    updates: Partial<Appointment>
  ): Promise<Appointment> {
    const updated = mockStore.updateDocument("appointments", id, updates);
    if (updated) {
      await this.logActivity(
        updated.patientId,
        "system",
        "Caregiver",
        "UPDATED_APPOINTMENT",
        `Updated appointment with ${updated.doctorName} (${updated.status})`,
        "APPOINTMENT"
      );
    }
    return updated;
  }

  // Emergency Profile
  public async getEmergencyProfile(patientId: string): Promise<EmergencyProfile | null> {
    const all = mockStore.getCollection("emergencyProfiles");
    return Object.values(all).find((p) => p.patientId === patientId) || null;
  }

  public async saveEmergencyProfile(profile: EmergencyProfile): Promise<EmergencyProfile> {
    mockStore.setDocument("emergencyProfiles", profile.id, profile);
    await this.logActivity(
      profile.patientId,
      "system",
      "Caregiver",
      "UPDATED_EMERGENCY_PROFILE",
      `Updated Emergency Care Card information for ${profile.patientName}`,
      "EMERGENCY"
    );
    return profile;
  }

  // Notifications
  public async getNotifications(userId: string): Promise<NotificationItem[]> {
    const all = mockStore.getCollection("notifications");
    return Object.values(all)
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public async markNotificationAsRead(id: string): Promise<void> {
    mockStore.updateDocument("notifications", id, { read: true });
  }

  public async markAllNotificationsAsRead(userId: string): Promise<void> {
    const notifs = await this.getNotifications(userId);
    for (const n of notifs) {
      if (!n.read) {
        mockStore.updateDocument("notifications", n.id, { read: true });
      }
    }
  }

  // Invitations
  public async createInvitation(inv: Omit<Invitation, "id" | "createdAt" | "used">): Promise<Invitation> {
    const id = `inv_${Date.now()}`;
    const invitation: Invitation = {
      ...inv,
      id,
      used: false,
      createdAt: new Date().toISOString(),
    };
    mockStore.setDocument("invitations", id, invitation);
    return invitation;
  }

  public async getInvitationByToken(token: string): Promise<Invitation | null> {
    const all = mockStore.getCollection("invitations");
    return Object.values(all).find((i) => i.token === token) || null;
  }

  public async acceptInvitation(token: string, userId: string): Promise<PatientMembership> {
    const invitation = await this.getInvitationByToken(token);
    if (!invitation) throw new Error("Invitation not found");
    if (invitation.used) throw new Error("Invitation has already been redeemed");
    if (new Date(invitation.expiresAt).getTime() < Date.now()) {
      throw new Error("Invitation has expired");
    }

    mockStore.updateDocument("invitations", invitation.id, {
      used: true,
      usedAt: new Date().toISOString(),
    });

    const membershipId = `mem_${userId}_${invitation.patientId}`;
    const membership: PatientMembership = {
      id: membershipId,
      userId,
      patientId: invitation.patientId,
      role: invitation.role,
      relationship: invitation.relationship,
      escalationPriority: invitation.role === "PRIMARY_CAREGIVER" ? 0 : 1,
      receiveAlerts: true,
      createdAt: new Date().toISOString(),
    };
    mockStore.setDocument("patientMemberships", membershipId, membership);

    return membership;
  }

  // Activity Logs
  public async getActivityLogs(patientId: string): Promise<ActivityLog[]> {
    const all = mockStore.getCollection("activityLogs");
    return Object.values(all)
      .filter((l) => l.patientId === patientId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  public async logActivity(
    patientId: string,
    userId: string,
    userName: string,
    action: string,
    details: string,
    category: ActivityLog["category"] = "SYSTEM"
  ): Promise<ActivityLog> {
    const id = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const log: ActivityLog = {
      id,
      patientId,
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString(),
      category,
    };
    mockStore.setDocument("activityLogs", id, log);
    return log;
  }

  // AI Care Summaries
  public async getLatestSummary(patientId: string): Promise<AICareSummary | null> {
    const all = mockStore.getCollection("aiCareSummaries");
    const summaries = Object.values(all)
      .filter((s) => s.patientId === patientId)
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
    return summaries[0] || null;
  }

  public async saveSummary(summary: AICareSummary): Promise<AICareSummary> {
    mockStore.setDocument("aiCareSummaries", summary.id, summary);
    return summary;
  }
}

export const dbService = new DatabaseService();
