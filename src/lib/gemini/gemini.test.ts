import { describe, it, expect } from "vitest";
import { generateDeterministicSummary } from "./client";
import { PatientProfile, ScheduledDose, Appointment, ActivityLog } from "@/types";

const mockPatient: PatientProfile = {
  id: "patient_eleanor",
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
    escalationOrder: ["user_david"],
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("Gemini AI Care Insights & Fallback Engine", () => {
  it("generates a structured, clinical-safe summary with deterministic rules", () => {
    const doses: ScheduledDose[] = [
      {
        id: "d1",
        medicationId: "m1",
        patientId: "patient_eleanor",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime: "2026-11-14T09:00:00.000Z",
        gracePeriodDeadline: "2026-11-14T09:15:00.000Z",
        status: "TAKEN",
        confirmationType: "SELF_REPORTED",
        snoozeCount: 0,
        caregiverAlertGenerated: false,
        escalationLevel: 0,
        createdAt: "2026-11-14T00:00:00.000Z",
        updatedAt: "2026-11-14T09:05:00.000Z",
      },
      {
        id: "d2",
        medicationId: "m1",
        patientId: "patient_eleanor",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime: "2026-11-13T09:00:00.000Z",
        gracePeriodDeadline: "2026-11-13T09:15:00.000Z",
        status: "MISSED",
        confirmationType: "NONE",
        snoozeCount: 0,
        caregiverAlertGenerated: true,
        escalationLevel: 1,
        createdAt: "2026-11-13T00:00:00.000Z",
        updatedAt: "2026-11-13T09:16:00.000Z",
      },
    ];

    const appointments: Appointment[] = [
      {
        id: "apt_1",
        patientId: "patient_eleanor",
        doctorName: "Dr. Robert Chen",
        specialty: "Cardiology",
        hospitalOrClinic: "Mercy Heart Center",
        appointmentDate: "2026-11-20",
        appointmentTime: "10:30",
        reasonForVisit: "Hypertension checkup",
        reminderPreferences: { remind24hBefore: true, remind2hBefore: true },
        status: "SCHEDULED",
        createdAt: "2026-11-01T00:00:00.000Z",
        updatedAt: "2026-11-01T00:00:00.000Z",
      },
    ];

    const logs: ActivityLog[] = [
      {
        id: "log_1",
        patientId: "patient_eleanor",
        userId: "user_patient",
        userName: "Eleanor Vance",
        action: "CONFIRMED_DOSE",
        details: "Took morning Lisinopril",
        timestamp: "2026-11-14T09:05:00.000Z",
        category: "MEDICATION",
      },
    ];

    const summary = generateDeterministicSummary(
      mockPatient,
      doses,
      appointments,
      logs,
      "2026-11-10",
      "2026-11-15"
    );

    expect(summary.patientId).toBe("patient_eleanor");
    expect(summary.isDeterministicFallback).toBe(true);
    expect(summary.adherenceRate).toBe(50); // 1 taken of 2 eligible = 50%
    expect(summary.executiveSummary).toContain("Eleanor Vance");
    expect(summary.missedDoseReview).toContain("Lisinopril");
    expect(summary.upcomingAppointmentsSummary).toContain("Dr. Robert Chen");
    expect(summary.suggestedFollowUps.length).toBeGreaterThan(0);

    // Verify clinical safety: no prescription alteration suggestions
    for (const followUp of summary.suggestedFollowUps) {
      expect(followUp.toLowerCase()).not.toContain("change dosage");
      expect(followUp.toLowerCase()).not.toContain("prescribe");
    }
  });
});
