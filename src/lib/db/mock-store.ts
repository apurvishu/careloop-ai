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
} from "@/types";

export interface DatabaseState {
  users: Record<string, UserProfile>;
  patients: Record<string, PatientProfile>;
  patientMemberships: Record<string, PatientMembership>;
  medications: Record<string, Medication>;
  scheduledDoses: Record<string, ScheduledDose>;
  caregiverAlerts: Record<string, CaregiverAlert>;
  appointments: Record<string, Appointment>;
  notifications: Record<string, NotificationItem>;
  invitations: Record<string, Invitation>;
  emergencyProfiles: Record<string, EmergencyProfile>;
  activityLogs: Record<string, ActivityLog>;
  aiCareSummaries: Record<string, AICareSummary>;
}

export function getInitialDatabaseState(): DatabaseState {
  const todayStr = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  // Create simulated doses for past 7 days to give rich analytics
  const scheduledDoses: Record<string, ScheduledDose> = {};
  const medications: Record<string, Medication> = {
    med_lisinopril: {
      id: "med_lisinopril",
      patientId: "patient_eleanor_vance",
      name: "Lisinopril",
      dosage: "10mg (1 tablet)",
      frequency: "ONCE_DAILY",
      scheduledTimes: ["09:00"],
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: "2026-01-01",
      prescribingDoctor: "Dr. Robert Chen (Cardiology)",
      instructions: "Take once daily in the morning with water. Monitor blood pressure.",
      notes: "Do not skip doses. For hypertension control.",
      isActive: true,
      createdAt: "2026-01-01T08:00:00.000Z",
      updatedAt: "2026-01-01T08:00:00.000Z",
    },
    med_metformin: {
      id: "med_metformin",
      patientId: "patient_eleanor_vance",
      name: "Metformin ER",
      dosage: "500mg (1 tablet)",
      frequency: "TWICE_DAILY",
      scheduledTimes: ["08:30", "20:30"],
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: "2026-01-01",
      prescribingDoctor: "Dr. Meera Patel (Endocrinology)",
      instructions: "Take with meals to minimize gastrointestinal discomfort.",
      notes: "Extended release. Swallow whole.",
      isActive: true,
      createdAt: "2026-01-01T08:00:00.000Z",
      updatedAt: "2026-01-01T08:00:00.000Z",
    },
    med_atorvastatin: {
      id: "med_atorvastatin",
      patientId: "patient_eleanor_vance",
      name: "Atorvastatin",
      dosage: "20mg (1 tablet)",
      frequency: "ONCE_DAILY",
      scheduledTimes: ["21:00"],
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: "2026-01-01",
      prescribingDoctor: "Dr. Robert Chen (Cardiology)",
      instructions: "Take in the evening before bedtime.",
      notes: "Lipid management.",
      isActive: true,
      createdAt: "2026-01-01T08:00:00.000Z",
      updatedAt: "2026-01-01T08:00:00.000Z",
    },
  };

  // Generate 7 days of historical doses
  for (let d = 6; d >= 1; d--) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - d);
    const dateStr = pastDate.toISOString().slice(0, 10);

    // Lisinopril at 09:00
    const dose1Id = `dose_lis_${dateStr}_0900`;
    scheduledDoses[dose1Id] = {
      id: dose1Id,
      medicationId: "med_lisinopril",
      patientId: "patient_eleanor_vance",
      medicationName: "Lisinopril",
      dosage: "10mg (1 tablet)",
      scheduledTime: `${dateStr}T09:00:00.000Z`,
      gracePeriodDeadline: `${dateStr}T09:15:00.000Z`,
      status: "TAKEN",
      confirmationType: "SELF_REPORTED",
      takenAt: `${dateStr}T09:05:00.000Z`,
      takenByUserId: "user_patient_eleanor",
      snoozeCount: 0,
      caregiverAlertGenerated: false,
      escalationLevel: 0,
      createdAt: `${dateStr}T00:00:00.000Z`,
      updatedAt: `${dateStr}T09:05:00.000Z`,
    };

    // Metformin at 08:30 (One day missed to show real analytics)
    const dose2Id = `dose_met_${dateStr}_0830`;
    const isMissed = d === 2;
    scheduledDoses[dose2Id] = {
      id: dose2Id,
      medicationId: "med_metformin",
      patientId: "patient_eleanor_vance",
      medicationName: "Metformin ER",
      dosage: "500mg (1 tablet)",
      scheduledTime: `${dateStr}T08:30:00.000Z`,
      gracePeriodDeadline: `${dateStr}T08:45:00.000Z`,
      status: isMissed ? "MISSED" : "TAKEN",
      confirmationType: isMissed ? "NONE" : "SELF_REPORTED",
      takenAt: isMissed ? undefined : `${dateStr}T08:35:00.000Z`,
      snoozeCount: 0,
      caregiverAlertGenerated: isMissed,
      escalationLevel: isMissed ? 1 : 0,
      createdAt: `${dateStr}T00:00:00.000Z`,
      updatedAt: `${dateStr}T09:00:00.000Z`,
    };

    // Atorvastatin at 21:00
    const dose3Id = `dose_ato_${dateStr}_2100`;
    scheduledDoses[dose3Id] = {
      id: dose3Id,
      medicationId: "med_atorvastatin",
      patientId: "patient_eleanor_vance",
      medicationName: "Atorvastatin",
      dosage: "20mg (1 tablet)",
      scheduledTime: `${dateStr}T21:00:00.000Z`,
      gracePeriodDeadline: `${dateStr}T21:15:00.000Z`,
      status: "TAKEN",
      confirmationType: "SELF_REPORTED",
      takenAt: `${dateStr}T21:10:00.000Z`,
      takenByUserId: "user_patient_eleanor",
      snoozeCount: 0,
      caregiverAlertGenerated: false,
      escalationLevel: 0,
      createdAt: `${dateStr}T00:00:00.000Z`,
      updatedAt: `${dateStr}T21:10:00.000Z`,
    };
  }

  // Today's Doses
  // 1. Morning Metformin (Taken)
  const todayMetMorning = `dose_met_${todayStr}_0830`;
  scheduledDoses[todayMetMorning] = {
    id: todayMetMorning,
    medicationId: "med_metformin",
    patientId: "patient_eleanor_vance",
    medicationName: "Metformin ER",
    dosage: "500mg (1 tablet)",
    scheduledTime: `${todayStr}T08:30:00.000Z`,
    gracePeriodDeadline: `${todayStr}T08:45:00.000Z`,
    status: "TAKEN",
    confirmationType: "SELF_REPORTED",
    takenAt: `${todayStr}T08:32:00.000Z`,
    takenByUserId: "user_patient_eleanor",
    snoozeCount: 0,
    caregiverAlertGenerated: false,
    escalationLevel: 0,
    createdAt: `${todayStr}T00:00:00.000Z`,
    updatedAt: `${todayStr}T08:32:00.000Z`,
  };

  // 2. Morning Lisinopril (Pending or ready for demonstration)
  const todayLisMorning = `dose_lis_${todayStr}_0900`;
  scheduledDoses[todayLisMorning] = {
    id: todayLisMorning,
    medicationId: "med_lisinopril",
    patientId: "patient_eleanor_vance",
    medicationName: "Lisinopril",
    dosage: "10mg (1 tablet)",
    scheduledTime: `${todayStr}T09:00:00.000Z`,
    gracePeriodDeadline: `${todayStr}T09:15:00.000Z`,
    status: "PENDING",
    confirmationType: "NONE",
    snoozeCount: 0,
    caregiverAlertGenerated: false,
    escalationLevel: 0,
    createdAt: `${todayStr}T00:00:00.000Z`,
    updatedAt: `${todayStr}T00:00:00.000Z`,
  };

  // 3. Evening Metformin (Pending)
  const todayMetEvening = `dose_met_${todayStr}_2030`;
  scheduledDoses[todayMetEvening] = {
    id: todayMetEvening,
    medicationId: "med_metformin",
    patientId: "patient_eleanor_vance",
    medicationName: "Metformin ER",
    dosage: "500mg (1 tablet)",
    scheduledTime: `${todayStr}T20:30:00.000Z`,
    gracePeriodDeadline: `${todayStr}T20:45:00.000Z`,
    status: "PENDING",
    confirmationType: "NONE",
    snoozeCount: 0,
    caregiverAlertGenerated: false,
    escalationLevel: 0,
    createdAt: `${todayStr}T00:00:00.000Z`,
    updatedAt: `${todayStr}T00:00:00.000Z`,
  };

  // 4. Night Atorvastatin (Pending)
  const todayAtoNight = `dose_ato_${todayStr}_2100`;
  scheduledDoses[todayAtoNight] = {
    id: todayAtoNight,
    medicationId: "med_atorvastatin",
    patientId: "patient_eleanor_vance",
    medicationName: "Atorvastatin",
    dosage: "20mg (1 tablet)",
    scheduledTime: `${todayStr}T21:00:00.000Z`,
    gracePeriodDeadline: `${todayStr}T21:15:00.000Z`,
    status: "PENDING",
    confirmationType: "NONE",
    snoozeCount: 0,
    caregiverAlertGenerated: false,
    escalationLevel: 0,
    createdAt: `${todayStr}T00:00:00.000Z`,
    updatedAt: `${todayStr}T00:00:00.000Z`,
  };

  return {
    users: {
      user_patient_eleanor: {
        id: "user_patient_eleanor",
        email: "eleanor.vance@careloop.local",
        displayName: "Eleanor Vance",
        role: "PATIENT",
        phoneNumber: "+1 (555) 234-5678",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: nowIso,
        preferredLanguage: "en",
        accessibilitySettings: {
          largeText: true,
          highContrast: false,
          reducedMotion: false,
          voiceEnabled: true,
          screenReaderOptimized: true,
        },
      },
      user_caregiver_david: {
        id: "user_caregiver_david",
        email: "david.vance@careloop.local",
        displayName: "David Vance",
        role: "PRIMARY_CAREGIVER",
        phoneNumber: "+1 (555) 345-6789",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: nowIso,
      },
      user_family_sarah: {
        id: "user_family_sarah",
        email: "sarah.vance@careloop.local",
        displayName: "Sarah Vance",
        role: "FAMILY_MEMBER",
        phoneNumber: "+1 (555) 456-7890",
        createdAt: "2026-01-02T00:00:00.000Z",
        updatedAt: nowIso,
      },
      user_family_michael: {
        id: "user_family_michael",
        email: "michael.vance@careloop.local",
        displayName: "Michael Vance",
        role: "FAMILY_MEMBER",
        phoneNumber: "+1 (555) 567-8901",
        createdAt: "2026-01-03T00:00:00.000Z",
        updatedAt: nowIso,
      },
    },
    patients: {
      patient_eleanor_vance: {
        id: "patient_eleanor_vance",
        userId: "user_patient_eleanor",
        fullName: "Eleanor Vance",
        dateOfBirth: "1948-04-12",
        gender: "Female",
        bloodGroup: "O+",
        timeZone: "Asia/Kolkata",
        primaryCaregiverId: "user_caregiver_david",
        address: "742 Evergreen Terrace, Springfield",
        phone: "+1 (555) 234-5678",
        emergencyContact: "David Vance (+1 555-345-6789)",
        escalationSettings: {
          gracePeriodMinutes: 15,
          escalationDelayMinutes: 15,
          enableEmailAlerts: true,
          enableInAppAlerts: true,
          escalationOrder: ["user_caregiver_david", "user_family_sarah", "user_family_michael"],
        },
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: nowIso,
      },
    },
    patientMemberships: {
      mem_david_eleanor: {
        id: "mem_david_eleanor",
        userId: "user_caregiver_david",
        patientId: "patient_eleanor_vance",
        role: "PRIMARY_CAREGIVER",
        relationship: "Son",
        escalationPriority: 0,
        receiveAlerts: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      mem_sarah_eleanor: {
        id: "mem_sarah_eleanor",
        userId: "user_family_sarah",
        patientId: "patient_eleanor_vance",
        role: "FAMILY_MEMBER",
        relationship: "Daughter",
        escalationPriority: 1,
        receiveAlerts: true,
        createdAt: "2026-01-02T00:00:00.000Z",
      },
      mem_michael_eleanor: {
        id: "mem_michael_eleanor",
        userId: "user_family_michael",
        patientId: "patient_eleanor_vance",
        role: "FAMILY_MEMBER",
        relationship: "Grandson",
        escalationPriority: 2,
        receiveAlerts: true,
        createdAt: "2026-01-03T00:00:00.000Z",
      },
      mem_eleanor_self: {
        id: "mem_eleanor_self",
        userId: "user_patient_eleanor",
        patientId: "patient_eleanor_vance",
        role: "PATIENT",
        relationship: "Self",
        escalationPriority: -1,
        receiveAlerts: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    },
    medications,
    scheduledDoses,
    caregiverAlerts: {},
    appointments: {
      apt_cardio_upcoming: {
        id: "apt_cardio_upcoming",
        patientId: "patient_eleanor_vance",
        doctorName: "Dr. Robert Chen",
        specialty: "Cardiology",
        hospitalOrClinic: "Mercy General Heart Center",
        appointmentDate: "2026-11-20",
        appointmentTime: "10:30",
        reasonForVisit: "Routine 6-month hypertension review and ECG",
        notes: "Bring blood pressure self-monitoring log.",
        reminderPreferences: {
          remind24hBefore: true,
          remind2hBefore: true,
        },
        status: "SCHEDULED",
        createdAt: "2026-11-01T00:00:00.000Z",
        updatedAt: nowIso,
      },
      apt_endo_past: {
        id: "apt_endo_past",
        patientId: "patient_eleanor_vance",
        doctorName: "Dr. Meera Patel",
        specialty: "Endocrinology",
        hospitalOrClinic: "Springfield Wellness Clinic",
        appointmentDate: "2026-10-15",
        appointmentTime: "14:00",
        reasonForVisit: "HbA1c diabetes follow-up",
        notes: "HbA1c was 6.8%. Continued current Metformin ER dose.",
        reminderPreferences: {
          remind24hBefore: true,
          remind2hBefore: true,
        },
        status: "COMPLETED",
        createdAt: "2026-10-01T00:00:00.000Z",
        updatedAt: "2026-10-15T15:00:00.000Z",
      },
    },
    notifications: {
      notif_welcome: {
        id: "notif_welcome",
        userId: "user_caregiver_david",
        patientId: "patient_eleanor_vance",
        title: "CareLoop AI Active",
        message: "CareLoop AI is monitoring Eleanor Vance's medication and care routine.",
        type: "SYSTEM",
        read: true,
        deliveryStatus: "DELIVERED",
        createdAt: "2026-11-15T00:00:00.000Z",
      },
    },
    invitations: {},
    emergencyProfiles: {
      emg_eleanor: {
        id: "emg_eleanor",
        patientId: "patient_eleanor_vance",
        patientName: "Eleanor Vance",
        dateOfBirth: "1948-04-12",
        bloodType: "O+",
        emergencyContacts: [
          {
            name: "David Vance",
            relationship: "Son (Primary Caregiver)",
            phone: "+1 (555) 345-6789",
            isPrimary: true,
          },
          {
            name: "Sarah Vance",
            relationship: "Daughter",
            phone: "+1 (555) 456-7890",
            isPrimary: false,
          },
          {
            name: "Michael Vance",
            relationship: "Grandson",
            phone: "+1 (555) 567-8901",
            isPrimary: false,
          },
        ],
        allergies: ["Penicillin (Severe Rash)", "Sulfa Drugs (Hives)"],
        criticalConditions: [
          "Primary Hypertension (Controlled)",
          "Type 2 Diabetes Mellitus",
          "Mild Osteoarthritis (Knees)",
        ],
        currentMedicationsSummary: [
          "Lisinopril 10mg — Morning daily",
          "Metformin ER 500mg — Morning and Evening daily",
          "Atorvastatin 20mg — Nightly",
        ],
        doctorName: "Dr. Robert Chen",
        doctorPhone: "+1 (555) 789-0123",
        preferredHospital: "St. Jude Memorial Hospital (Emergency Dept)",
        specialInstructions: "Patient wears dentures and reading glasses. Do not administer Penicillin class antibiotics under any circumstances.",
        lastUpdated: nowIso,
        disclaimerAccepted: true,
      },
    },
    activityLogs: {
      act_init: {
        id: "act_init",
        patientId: "patient_eleanor_vance",
        userId: "user_patient_eleanor",
        userName: "Eleanor Vance",
        action: "CONFIRMED_DOSE",
        details: "Confirmed morning Metformin ER (500mg) at 8:32 AM",
        timestamp: `${todayStr}T08:32:00.000Z`,
        category: "MEDICATION",
      },
    },
    aiCareSummaries: {},
  };
}

class MockStore {
  private state: DatabaseState;
  private readonly storageKey = "careloop_mock_db_v1";

  constructor() {
    this.state = getInitialDatabaseState();
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          this.state = JSON.parse(stored);
        } else {
          this.persist();
        }
      } catch {
        // Fallback to in-memory
      }
    }
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      } catch {
        // Ignore quota/access errors
      }
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public resetToInitial(): DatabaseState {
    this.state = getInitialDatabaseState();
    this.persist();
    return this.state;
  }

  public getCollection<K extends keyof DatabaseState>(collection: K): DatabaseState[K] {
    return this.state[collection];
  }

  public getDocument<K extends keyof DatabaseState>(
    collection: K,
    id: string
  ): DatabaseState[K][string] | null {
    const col = this.state[collection] as Record<string, DatabaseState[K][string]>;
    return col[id] || null;
  }

  public setDocument<K extends keyof DatabaseState>(
    collection: K,
    id: string,
    data: any
  ): void {
    const col = this.state[collection] as Record<string, any>;
    col[id] = data;
    this.persist();
  }

  public updateDocument<K extends keyof DatabaseState>(
    collection: K,
    id: string,
    updates: Partial<any>
  ): any {
    const col = this.state[collection] as Record<string, any>;
    const existing = col[id];
    if (!existing) {
      throw new Error(`Document ${id} not found in ${String(collection)}`);
    }
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    col[id] = updated;
    this.persist();
    return updated;
  }

  public deleteDocument<K extends keyof DatabaseState>(collection: K, id: string): boolean {
    const col = this.state[collection] as Record<string, any>;
    if (col[id]) {
      delete col[id];
      this.persist();
      return true;
    }
    return false;
  }
}

// Global singleton for server/client runtime
declare global {
  // eslint-disable-next-line no-var
  var __careloop_mock_store__: MockStore | undefined;
}

export const mockStore = globalThis.__careloop_mock_store__ || (globalThis.__careloop_mock_store__ = new MockStore());
