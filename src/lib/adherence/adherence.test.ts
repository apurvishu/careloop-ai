import { describe, it, expect } from "vitest";
import { calculateAdherenceStats } from "./calculator";
import { ScheduledDose } from "@/types";

describe("Adherence Analytics Calculator", () => {
  it("calculates adherence rate accurately using formula: Taken / Eligible * 100", () => {
    const today = new Date("2026-11-15T12:00:00.000Z");

    const doses: ScheduledDose[] = [
      // 3 Taken doses
      {
        id: "d1",
        medicationId: "m1",
        patientId: "p1",
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
        patientId: "p1",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime: "2026-11-13T09:00:00.000Z",
        gracePeriodDeadline: "2026-11-13T09:15:00.000Z",
        status: "TAKEN",
        confirmationType: "SELF_REPORTED",
        snoozeCount: 0,
        caregiverAlertGenerated: false,
        escalationLevel: 0,
        createdAt: "2026-11-13T00:00:00.000Z",
        updatedAt: "2026-11-13T09:05:00.000Z",
      },
      {
        id: "d3",
        medicationId: "m1",
        patientId: "p1",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime: "2026-11-12T09:00:00.000Z",
        gracePeriodDeadline: "2026-11-12T09:15:00.000Z",
        status: "TAKEN",
        confirmationType: "SELF_REPORTED",
        snoozeCount: 0,
        caregiverAlertGenerated: false,
        escalationLevel: 0,
        createdAt: "2026-11-12T00:00:00.000Z",
        updatedAt: "2026-11-12T09:05:00.000Z",
      },
      // 1 Missed dose
      {
        id: "d4",
        medicationId: "m1",
        patientId: "p1",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime: "2026-11-11T09:00:00.000Z",
        gracePeriodDeadline: "2026-11-11T09:15:00.000Z",
        status: "MISSED",
        confirmationType: "NONE",
        snoozeCount: 0,
        caregiverAlertGenerated: true,
        escalationLevel: 1,
        createdAt: "2026-11-11T00:00:00.000Z",
        updatedAt: "2026-11-11T09:30:00.000Z",
      },
      // 1 Pending dose later today (should NOT penalize adherence score)
      {
        id: "d5",
        medicationId: "m1",
        patientId: "p1",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime: "2026-11-15T20:00:00.000Z",
        gracePeriodDeadline: "2026-11-15T20:15:00.000Z",
        status: "PENDING",
        confirmationType: "NONE",
        snoozeCount: 0,
        caregiverAlertGenerated: false,
        escalationLevel: 0,
        createdAt: "2026-11-15T00:00:00.000Z",
        updatedAt: "2026-11-15T00:00:00.000Z",
      },
    ];

    const stats = calculateAdherenceStats(doses, "weekly", today);

    expect(stats.totalScheduled).toBe(5);
    expect(stats.confirmedTaken).toBe(3);
    expect(stats.missed).toBe(1);
    expect(stats.pending).toBe(1);

    // Eligible doses = 3 taken + 1 missed = 4
    // Adherence = (3 / 4) * 100 = 75%
    expect(stats.adherencePercentage).toBe(75);
  });

  it("returns 100% adherence when all eligible doses are taken", () => {
    const today = new Date("2026-11-15T12:00:00.000Z");
    const doses: ScheduledDose[] = [
      {
        id: "d1",
        medicationId: "m1",
        patientId: "p1",
        medicationName: "Metformin ER",
        dosage: "500mg",
        scheduledTime: "2026-11-15T08:30:00.000Z",
        gracePeriodDeadline: "2026-11-15T08:45:00.000Z",
        status: "TAKEN",
        confirmationType: "SELF_REPORTED",
        snoozeCount: 0,
        caregiverAlertGenerated: false,
        escalationLevel: 0,
        createdAt: "2026-11-15T00:00:00.000Z",
        updatedAt: "2026-11-15T08:32:00.000Z",
      },
    ];

    const stats = calculateAdherenceStats(doses, "daily", today);
    expect(stats.adherencePercentage).toBe(100);
  });
});
