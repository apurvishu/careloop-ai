import { z } from "zod";

export const medicationSchema = z.object({
  name: z.string().min(2, "Medicine name must be at least 2 characters").max(100),
  dosage: z.string().min(1, "Dosage is required (e.g. 10mg, 1 tablet)").max(50),
  frequency: z.enum(["ONCE_DAILY", "TWICE_DAILY", "THRICE_DAILY", "CUSTOM", "AS_NEEDED"]),
  scheduledTimes: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:mm (24hr)"))
    .min(1, "At least one scheduled time is required"),
  selectedDays: z.array(z.number().int().min(0).max(6))
    .min(1, "At least one day of the week must be selected"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD").optional().or(z.literal("")),
  prescribingDoctor: z.string().max(100).optional(),
  instructions: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

export const doseActionSchema = z.object({
  doseId: z.string().min(1, "Dose ID is required"),
  action: z.enum(["TAKE", "SNOOZE", "SKIP", "UNABLE"]),
  reason: z.string().max(500).optional(),
  snoozeMinutes: z.number().int().min(5).max(120).optional(),
  confirmationType: z.enum(["SELF_REPORTED", "VERIFIED"]).default("SELF_REPORTED"),
});

export const alertAcknowledgeSchema = z.object({
  alertId: z.string().min(1, "Alert ID is required"),
  notes: z.string().max(500).optional(),
});

export const appointmentSchema = z.object({
  doctorName: z.string().min(2, "Doctor name must be at least 2 characters").max(100),
  specialty: z.string().max(100).optional(),
  hospitalOrClinic: z.string().min(2, "Hospital or Clinic name is required").max(150),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  appointmentTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:mm (24hr)"),
  reasonForVisit: z.string().min(3, "Reason for visit is required").max(300),
  notes: z.string().max(500).optional(),
  reminderPreferences: z.object({
    remind24hBefore: z.boolean().default(true),
    remind2hBefore: z.boolean().default(true),
  }),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"]).default("SCHEDULED"),
});

export const familyInviteSchema = z.object({
  inviteeEmail: z.string().email("Invalid email address"),
  role: z.enum(["PRIMARY_CAREGIVER", "FAMILY_MEMBER"]),
  relationship: z.string().min(2, "Relationship is required (e.g. Daughter, Son, Nurse)").max(50),
});

export const emergencyContactSchema = z.object({
  name: z.string().min(2, "Contact name is required"),
  relationship: z.string().min(2, "Relationship is required"),
  phone: z.string().min(7, "Valid phone number required"),
  isPrimary: z.boolean().default(false),
});

export const emergencyProfileSchema = z.object({
  patientName: z.string().min(2, "Patient name is required"),
  dateOfBirth: z.string().min(4, "Date of birth is required"),
  bloodType: z.string().max(10),
  emergencyContacts: z.array(emergencyContactSchema).min(1, "At least one emergency contact is required"),
  allergies: z.array(z.string()),
  criticalConditions: z.array(z.string()),
  currentMedicationsSummary: z.array(z.string()),
  doctorName: z.string().optional(),
  doctorPhone: z.string().optional(),
  preferredHospital: z.string().min(2, "Preferred hospital is required"),
  specialInstructions: z.string().max(1000).optional(),
  disclaimerAccepted: z.boolean().refine(val => val === true, "Disclaimer must be accepted"),
});

export const patientOnboardingSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be YYYY-MM-DD"),
  gender: z.enum(["Female", "Male", "Other", "Prefer not to say"]),
  bloodGroup: z.string().optional(),
  timeZone: z.string().default("Asia/Kolkata"),
  phone: z.string().optional(),
  address: z.string().optional(),
  gracePeriodMinutes: z.number().int().min(5).max(120).default(15),
  escalationDelayMinutes: z.number().int().min(5).max(120).default(15),
});

export const userRegistrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  role: z.enum(["PATIENT", "PRIMARY_CAREGIVER", "FAMILY_MEMBER"]),
  phoneNumber: z.string().optional(),
});
