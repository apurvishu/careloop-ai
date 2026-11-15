/**
 * CareLoop AI - Comprehensive Type Definitions
 * Strict TypeScript types for entire application
 */

export type UserRole = "PATIENT" | "PRIMARY_CAREGIVER" | "FAMILY_MEMBER";

export type MedicationStatus = "PENDING" | "TAKEN" | "MISSED" | "SKIPPED" | "SNOOZED";

export type DoseConfirmationType = "SELF_REPORTED" | "VERIFIED" | "NONE";

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AlertStatus = "PENDING" | "ACKNOWLEDGED" | "RESOLVED" | "ESCALATED";

export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";

export type NotificationType =
  | "MEDICATION_DUE"
  | "MEDICATION_MISSED"
  | "CAREGIVER_ALERT"
  | "ALERT_ESCALATION"
  | "APPOINTMENT_REMINDER"
  | "FAMILY_INVITE"
  | "CARE_SUMMARY_READY"
  | "SYSTEM";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  preferredLanguage?: "en" | "hi" | "kn";
  accessibilitySettings?: AccessibilitySettings;
}

export interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  voiceEnabled: boolean;
  screenReaderOptimized: boolean;
}

export interface PatientProfile {
  id: string;
  userId?: string; // If patient has own user account
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  timeZone: string;
  primaryCaregiverId: string;
  address?: string;
  phone?: string;
  emergencyContact?: string;
  escalationSettings: EscalationConfig;
  createdAt: string;
  updatedAt: string;
}

export interface EscalationConfig {
  gracePeriodMinutes: number; // e.g. 15 mins after scheduled time before caregiver alert
  escalationDelayMinutes: number; // e.g. 15 mins after caregiver alert before family escalation
  enableEmailAlerts: boolean;
  enableInAppAlerts: boolean;
  escalationOrder: string[]; // Ordered list of user IDs to alert (Caregiver first, then family members)
}

export interface PatientMembership {
  id: string; // `${userId}_${patientId}`
  userId: string;
  patientId: string;
  role: UserRole;
  relationship: string; // e.g., "Son", "Daughter", "Self", "Nurse"
  escalationPriority: number; // 0 = primary caregiver, 1 = first family fallback, etc.
  receiveAlerts: boolean;
  createdAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string; // e.g., "10mg", "1 tablet"
  frequency: "ONCE_DAILY" | "TWICE_DAILY" | "THRICE_DAILY" | "CUSTOM" | "AS_NEEDED";
  scheduledTimes: string[]; // ["09:00", "21:00"] (24-hr format HH:mm)
  selectedDays: number[]; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  prescribingDoctor?: string;
  instructions?: string; // e.g., "Take with food", "Drink full glass of water"
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledDose {
  id: string;
  medicationId: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string; // ISO 8601 string or YYYY-MM-DDTHH:mm:00
  gracePeriodDeadline: string; // When primary caregiver should be alerted
  status: MedicationStatus;
  confirmationType: DoseConfirmationType;
  takenAt?: string;
  takenByUserId?: string;
  snoozedUntil?: string;
  snoozeCount: number;
  skipReason?: string;
  unableToTakeReason?: string;
  caregiverAlertGenerated: boolean;
  caregiverAlertId?: string;
  escalationLevel: number; // 0 = none, 1 = caregiver, 2 = family member 1, 3 = family member 2...
  createdAt: string;
  updatedAt: string;
}

export interface CaregiverAlert {
  id: string;
  patientId: string;
  doseId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  severity: AlertSeverity;
  status: AlertStatus;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  acknowledgmentNotes?: string;
  escalatedToUserIds: string[];
  currentEscalationIndex: number;
  lastEscalatedAt: string;
  resolvedAt?: string;
  resolutionReason?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  specialty?: string;
  hospitalOrClinic: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  reasonForVisit: string;
  notes?: string;
  reminderPreferences: {
    remind24hBefore: boolean;
    remind2hBefore: boolean;
  };
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  patientId?: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: string; // doseId, appointmentId, or alertId
  read: boolean;
  actionUrl?: string;
  deliveryStatus: "DELIVERED" | "QUEUED" | "FAILED";
  createdAt: string;
}

export interface Invitation {
  id: string;
  patientId: string;
  patientName: string;
  inviterUserId: string;
  inviterName: string;
  inviteeEmail: string;
  role: UserRole;
  relationship: string;
  token: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
  createdAt: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface EmergencyProfile {
  id: string;
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  bloodType: string;
  emergencyContacts: EmergencyContact[];
  allergies: string[];
  criticalConditions: string[];
  currentMedicationsSummary: string[];
  doctorName?: string;
  doctorPhone?: string;
  preferredHospital: string;
  specialInstructions?: string;
  lastUpdated: string;
  disclaimerAccepted: boolean;
}

export interface ActivityLog {
  id: string;
  patientId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  category: "MEDICATION" | "ALERT" | "APPOINTMENT" | "SYSTEM" | "EMERGENCY";
}

export interface AICareSummary {
  id: string;
  patientId: string;
  generatedAt: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  overallCareStatus: string;
  adherenceRate: number;
  totalScheduledDoses: number;
  confirmedTakenDoses: number;
  missedDoses: number;
  skippedDoses: number;
  unconfirmedDoses: number;
  executiveSummary: string;
  adherenceAnalysis: string;
  missedDoseReview: string;
  upcomingAppointmentsSummary: string;
  recentCareChanges: string;
  suggestedFollowUps: string[];
  aiModelUsed: string;
  isDeterministicFallback: boolean;
}

export interface AdherenceStats {
  period: "daily" | "weekly" | "monthly";
  totalScheduled: number;
  confirmedTaken: number;
  missed: number;
  skipped: number;
  pending: number;
  adherencePercentage: number;
  dailyTrends: {
    date: string;
    scheduled: number;
    taken: number;
    missed: number;
    adherence: number;
  }[];
  medicationBreakdown: {
    medicationId: string;
    medicationName: string;
    total: number;
    taken: number;
    missed: number;
    adherencePercentage: number;
  }[];
}
