import { describe, it, expect } from "vitest";
import {
  evaluateDosesAndEscalate,
  generateDailyDoses,
} from "./engine";
import { PatientProfile, ScheduledDose, CaregiverAlert, Medication } from "@/types";

const mockPatient: PatientProfile = {
  id: "patient_eleanor",
  userId: "user_patient_eleanor",
  fullName: "Eleanor Vance",
  dateOfBirth: "1948-04-12",
  gender: "Female",
  timeZone: "Asia/Kolkata",
  primaryCaregiverId: "user_david",
  escalationSettings: {
    gracePeriodMinutes: 15,
    escalationDelayMinutes: 15,
    enableEmailAlerts: true,
    enableInAppAlerts: true,
    escalationOrder: ["user_david", "user_sarah", "user_michael"],
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("Smart Medication Escalation Engine", () => {
  it("generates daily doses deterministically based on schedule and recurrence days", () => {
    const meds: Medication[] = [
      {
        id: "med_lis",
        patientId: "patient_eleanor",
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "ONCE_DAILY",
        scheduledTimes: ["09:00"],
        selectedDays: [0, 1, 2, 3, 4, 5, 6], // every day
        startDate: "2026-01-01",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    const targetDate = new Date("2026-11-15T00:00:00.000Z");
    const doses = generateDailyDoses("patient_eleanor", meds, targetDate, 15);

    expect(doses).toHaveLength(1);
    expect(doses[0].id).toBe("dose_med_lis_2026-11-15_0900");
    expect(doses[0].medicationName).toBe("Lisinopril");
    expect(doses[0].status).toBe("PENDING");
  });

  it("does not generate caregiver alert before grace period deadline", () => {
    const scheduledTime = "2026-11-15T09:00:00.000Z";
    const doses: ScheduledDose[] = [
      {
        id: "dose_1",
        medicationId: "med_lis",
        patientId: "patient_eleanor",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime,
        gracePeriodDeadline: "2026-11-15T09:15:00.000Z",
        status: "PENDING",
        confirmationType: "NONE",
        snoozeCount: 0,
        caregiverAlertGenerated: false,
        escalationLevel: 0,
        createdAt: "2026-11-15T00:00:00.000Z",
        updatedAt: "2026-11-15T00:00:00.000Z",
      },
    ];

    // Evaluate at 09:10 (within 15-min grace period)
    const result = evaluateDosesAndEscalate(
      mockPatient,
      doses,
      [],
      "2026-11-15T09:10:00.000Z"
    );

    expect(result.newAlerts).toHaveLength(0);
    // Should have generated patient due reminder
    expect(result.notifications.some((n) => n.type === "MEDICATION_DUE")).toBe(true);
  });

  it("generates Tier 1 Caregiver Alert once grace period expires (e.g. at 09:16)", () => {
    const scheduledTime = "2026-11-15T09:00:00.000Z";
    const doses: ScheduledDose[] = [
      {
        id: "dose_1",
        medicationId: "med_lis",
        patientId: "patient_eleanor",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime,
        gracePeriodDeadline: "2026-11-15T09:15:00.000Z",
        status: "PENDING",
        confirmationType: "NONE",
        snoozeCount: 0,
        caregiverAlertGenerated: false,
        escalationLevel: 0,
        createdAt: "2026-11-15T00:00:00.000Z",
        updatedAt: "2026-11-15T00:00:00.000Z",
      },
    ];

    // Evaluate at 09:16 (grace period of 15m exceeded)
    const result = evaluateDosesAndEscalate(
      mockPatient,
      doses,
      [],
      "2026-11-15T09:16:00.000Z"
    );

    expect(result.newAlerts).toHaveLength(1);
    expect(result.newAlerts[0].escalatedToUserIds).toContain("user_david");
    expect(result.updatedDoses[0].status).toBe("MISSED");
    expect(result.updatedDoses[0].escalationLevel).toBe(1);

    // Primary caregiver notified
    const caregiverNotif = result.notifications.find((n) => n.userId === "user_david");
    expect(caregiverNotif).toBeDefined();
    expect(caregiverNotif?.type).toBe("CAREGIVER_ALERT");
  });

  it("escalates to Tier 2 family contact if caregiver alert remains unacknowledged after escalation delay", () => {
    const scheduledTime = "2026-11-15T09:00:00.000Z";
    const alertId = "alert_dose_1_lvl1";

    const doses: ScheduledDose[] = [
      {
        id: "dose_1",
        medicationId: "med_lis",
        patientId: "patient_eleanor",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime,
        gracePeriodDeadline: "2026-11-15T09:15:00.000Z",
        status: "MISSED",
        confirmationType: "NONE",
        snoozeCount: 0,
        caregiverAlertGenerated: true,
        caregiverAlertId: alertId,
        escalationLevel: 1,
        createdAt: "2026-11-15T00:00:00.000Z",
        updatedAt: "2026-11-15T09:16:00.000Z",
      },
    ];

    const existingAlerts: CaregiverAlert[] = [
      {
        id: alertId,
        patientId: "patient_eleanor",
        doseId: "dose_1",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime,
        severity: "HIGH",
        status: "PENDING",
        acknowledged: false, // NOT ACKNOWLEDGED
        escalatedToUserIds: ["user_david"],
        currentEscalationIndex: 0,
        lastEscalatedAt: "2026-11-15T09:16:00.000Z",
        createdAt: "2026-11-15T09:16:00.000Z",
      },
    ];

    // Evaluate at 09:32 (16 mins after caregiver alert, exceeding 15m delay)
    const result = evaluateDosesAndEscalate(
      mockPatient,
      doses,
      existingAlerts,
      "2026-11-15T09:32:00.000Z"
    );

    expect(result.updatedAlerts).toHaveLength(1);
    expect(result.updatedAlerts[0].status).toBe("ESCALATED");
    expect(result.updatedAlerts[0].currentEscalationIndex).toBe(1);
    // Escalated to Sarah (second in escalation order)
    expect(result.updatedAlerts[0].escalatedToUserIds).toEqual(["user_david", "user_sarah"]);

    const familyNotif = result.notifications.find((n) => n.userId === "user_sarah");
    expect(familyNotif).toBeDefined();
    expect(familyNotif?.type).toBe("ALERT_ESCALATION");
  });

  it("stops escalation and resolves alerts immediately when patient marks medication as taken", () => {
    const alertId = "alert_dose_1_lvl1";

    const doses: ScheduledDose[] = [
      {
        id: "dose_1",
        medicationId: "med_lis",
        patientId: "patient_eleanor",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime: "2026-11-15T09:00:00.000Z",
        gracePeriodDeadline: "2026-11-15T09:15:00.000Z",
        status: "TAKEN", // Patient confirmed!
        confirmationType: "SELF_REPORTED",
        takenAt: "2026-11-15T09:20:00.000Z",
        snoozeCount: 0,
        caregiverAlertGenerated: true,
        caregiverAlertId: alertId,
        escalationLevel: 1,
        createdAt: "2026-11-15T00:00:00.000Z",
        updatedAt: "2026-11-15T09:20:00.000Z",
      },
    ];

    const existingAlerts: CaregiverAlert[] = [
      {
        id: alertId,
        patientId: "patient_eleanor",
        doseId: "dose_1",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime: "2026-11-15T09:00:00.000Z",
        severity: "HIGH",
        status: "PENDING",
        acknowledged: false,
        escalatedToUserIds: ["user_david"],
        currentEscalationIndex: 0,
        lastEscalatedAt: "2026-11-15T09:16:00.000Z",
        createdAt: "2026-11-15T09:16:00.000Z",
      },
    ];

    const result = evaluateDosesAndEscalate(
      mockPatient,
      doses,
      existingAlerts,
      "2026-11-15T09:25:00.000Z"
    );

    // Alert must be resolved, not escalated
    expect(result.updatedAlerts).toHaveLength(1);
    expect(result.updatedAlerts[0].status).toBe("RESOLVED");
    expect(result.updatedAlerts[0].resolutionReason).toContain("taken");
  });

  it("respects snooze periods and defers caregiver alerts until snooze window expires", () => {
    const scheduledTime = "2026-11-15T09:00:00.000Z";
    // Snoozed at 09:10 for 15 mins -> active until 09:25
    const doses: ScheduledDose[] = [
      {
        id: "dose_1",
        medicationId: "med_lis",
        patientId: "patient_eleanor",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime,
        gracePeriodDeadline: "2026-11-15T09:15:00.000Z",
        status: "SNOOZED",
        snoozedUntil: "2026-11-15T09:25:00.000Z",
        confirmationType: "NONE",
        snoozeCount: 1,
        caregiverAlertGenerated: false,
        escalationLevel: 0,
        createdAt: "2026-11-15T00:00:00.000Z",
        updatedAt: "2026-11-15T09:10:00.000Z",
      },
    ];

    // Evaluate at 09:20 (during snooze window)
    const result = evaluateDosesAndEscalate(
      mockPatient,
      doses,
      [],
      "2026-11-15T09:20:00.000Z"
    );

    expect(result.newAlerts).toHaveLength(0);
  });
});
