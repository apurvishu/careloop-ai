import { describe, it, expect, beforeEach } from "vitest";
import { dbService } from "./service";
import { mockStore } from "./mock-store";

describe("Database Service & Care Coordination Logic", () => {
  beforeEach(() => {
    mockStore.resetToInitial();
  });

  it("confirms that caregiver acknowledgment does NOT mark medicine as taken", async () => {
    // 1. Create a missed dose and alert
    const alertId = "alert_test_ack";
    const doseId = "dose_test_ack";

    mockStore.setDocument("scheduledDoses", doseId, {
      id: doseId,
      medicationId: "med_lisinopril",
      patientId: "patient_eleanor_vance",
      medicationName: "Lisinopril",
      dosage: "10mg",
      scheduledTime: "2026-11-15T09:00:00.000Z",
      gracePeriodDeadline: "2026-11-15T09:15:00.000Z",
      status: "MISSED",
      confirmationType: "NONE",
      snoozeCount: 0,
      caregiverAlertGenerated: true,
      caregiverAlertId: alertId,
      escalationLevel: 1,
      createdAt: "2026-11-15T00:00:00.000Z",
      updatedAt: "2026-11-15T09:16:00.000Z",
    });

    mockStore.setDocument("caregiverAlerts", alertId, {
      id: alertId,
      patientId: "patient_eleanor_vance",
      doseId,
      medicationName: "Lisinopril",
      dosage: "10mg",
      scheduledTime: "2026-11-15T09:00:00.000Z",
      severity: "HIGH",
      status: "PENDING",
      acknowledged: false,
      escalatedToUserIds: ["user_caregiver_david"],
      currentEscalationIndex: 0,
      lastEscalatedAt: "2026-11-15T09:16:00.000Z",
      createdAt: "2026-11-15T09:16:00.000Z",
    });

    // Caregiver acknowledges alert
    const updatedAlert = await dbService.acknowledgeAlert(
      alertId,
      "user_caregiver_david",
      "Spoke with Eleanor, she is taking it now."
    );

    expect(updatedAlert.acknowledged).toBe(true);
    expect(updatedAlert.status).toBe("ACKNOWLEDGED");

    // CRITICAL SECURITY RULE: The dose itself must STILL be MISSED until patient confirms
    const doseAfterAck = await dbService.getDoseById(doseId);
    expect(doseAfterAck?.status).toBe("MISSED");
    expect(doseAfterAck?.confirmationType).toBe("NONE");
  });

  it("marks dose as taken and resolves any associated caregiver alert when patient confirms", async () => {
    const alertId = "alert_test_confirm";
    const doseId = "dose_test_confirm";

    mockStore.setDocument("scheduledDoses", doseId, {
      id: doseId,
      medicationId: "med_lisinopril",
      patientId: "patient_eleanor_vance",
      medicationName: "Lisinopril",
      dosage: "10mg",
      scheduledTime: "2026-11-15T09:00:00.000Z",
      gracePeriodDeadline: "2026-11-15T09:15:00.000Z",
      status: "MISSED",
      confirmationType: "NONE",
      snoozeCount: 0,
      caregiverAlertGenerated: true,
      caregiverAlertId: alertId,
      escalationLevel: 1,
      createdAt: "2026-11-15T00:00:00.000Z",
      updatedAt: "2026-11-15T09:16:00.000Z",
    });

    mockStore.setDocument("caregiverAlerts", alertId, {
      id: alertId,
      patientId: "patient_eleanor_vance",
      doseId,
      medicationName: "Lisinopril",
      dosage: "10mg",
      scheduledTime: "2026-11-15T09:00:00.000Z",
      severity: "HIGH",
      status: "PENDING",
      acknowledged: false,
      escalatedToUserIds: ["user_caregiver_david"],
      currentEscalationIndex: 0,
      lastEscalatedAt: "2026-11-15T09:16:00.000Z",
      createdAt: "2026-11-15T09:16:00.000Z",
    });

    // Patient marks medicine taken
    const confirmedDose = await dbService.markDoseTaken(
      doseId,
      "user_patient_eleanor",
      "SELF_REPORTED"
    );

    expect(confirmedDose.status).toBe("TAKEN");
    expect(confirmedDose.confirmationType).toBe("SELF_REPORTED");
    expect(confirmedDose.takenAt).toBeDefined();

    // Alert should be automatically resolved
    const alertAfterConfirm = mockStore.getDocument("caregiverAlerts", alertId);
    expect(alertAfterConfirm?.status).toBe("RESOLVED");
  });

  it("rejects expired and already-used family invitation tokens", async () => {
    // 1. Expired invitation test
    const expiredInvite = await dbService.createInvitation({
      patientId: "patient_eleanor_vance",
      patientName: "Eleanor Vance",
      inviterUserId: "user_caregiver_david",
      inviterName: "David Vance",
      inviteeEmail: "relative@careloop.local",
      role: "FAMILY_MEMBER",
      relationship: "Cousin",
      token: "token_expired_123",
      expiresAt: new Date(Date.now() - 3600000).toISOString(), // expired 1 hour ago
    });

    await expect(
      dbService.acceptInvitation("token_expired_123", "user_new_cousin")
    ).rejects.toThrow("Invitation has expired");

    // 2. Already used invitation test
    const validInvite = await dbService.createInvitation({
      patientId: "patient_eleanor_vance",
      patientName: "Eleanor Vance",
      inviterUserId: "user_caregiver_david",
      inviterName: "David Vance",
      inviteeEmail: "valid@careloop.local",
      role: "FAMILY_MEMBER",
      relationship: "Granddaughter",
      token: "token_valid_456",
      expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24h validity
    });

    // First acceptance succeeds
    const membership = await dbService.acceptInvitation("token_valid_456", "user_granddaughter");
    expect(membership.userId).toBe("user_granddaughter");

    // Second acceptance of same token must be rejected
    await expect(
      dbService.acceptInvitation("token_valid_456", "user_attacker")
    ).rejects.toThrow("already been redeemed");
  });
});
