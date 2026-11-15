/**
 * CareLoop AI - System Constants
 */

export const APP_NAME = "CareLoop AI";
export const APP_TAGLINE = "Intelligent Elderly Care & Safety Ecosystem";

export const DEFAULT_GRACE_PERIOD_MINUTES = 15;
export const DEFAULT_ESCALATION_DELAY_MINUTES = 15;
export const DEFAULT_SNOOZE_MINUTES = 15;

export const DEMO_PATIENT_ID = "patient_eleanor_vance";
export const DEMO_CAREGIVER_ID = "user_caregiver_david";
export const DEMO_FAMILY_MEMBER_1_ID = "user_family_sarah";
export const DEMO_FAMILY_MEMBER_2_ID = "user_family_michael";

export const ROLES = {
  PATIENT: "PATIENT",
  PRIMARY_CAREGIVER: "PRIMARY_CAREGIVER",
  FAMILY_MEMBER: "FAMILY_MEMBER",
} as const;

export const MEDICATION_STATUS = {
  PENDING: "PENDING",
  TAKEN: "TAKEN",
  MISSED: "MISSED",
  SKIPPED: "SKIPPED",
  SNOOZED: "SNOOZED",
} as const;

export const ALERT_STATUS = {
  PENDING: "PENDING",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  RESOLVED: "RESOLVED",
  ESCALATED: "ESCALATED",
} as const;

export const VOICE_COMMANDS = {
  MEDICATION_NOW: ["what medicine should i take now", "what medicine do i take", "current medicine", "medicine now"],
  NEXT_APPOINTMENT: ["when is my next appointment", "next appointment", "upcoming doctor visit", "doctor appointment"],
  MEDICATION_HISTORY: ["show my medication history", "medication history", "medicine log", "did i take my medicine"],
  REMIND_LATER: ["remind me in 15 minutes", "remind me later", "snooze reminder", "snooze"],
  CARE_ASSISTANCE: ["i need caregiver assistance", "call caregiver", "help me", "need help", "assist me"],
} as const;

export const MEDICAL_DISCLAIMER =
  "CareLoop AI is an assistive care coordination and adherence support tool. It is not an emergency response service and does not offer medical advice, diagnosis, or treatment. In medical emergencies, immediately contact your local emergency services (e.g., 911 or 112).";
