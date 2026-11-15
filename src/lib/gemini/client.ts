import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  PatientProfile,
  ScheduledDose,
  Appointment,
  ActivityLog,
  AICareSummary,
} from "@/types";
import { calculateAdherenceStats } from "@/lib/adherence/calculator";

/**
 * Generates a deterministic fallback care summary when the Gemini API is unreachable,
 * when the key is not set, or during offline mock evaluation.
 */
export function generateDeterministicSummary(
  patient: PatientProfile,
  doses: ScheduledDose[],
  appointments: Appointment[],
  activityLogs: ActivityLog[],
  startDateStr: string,
  endDateStr: string
): AICareSummary {
  const stats = calculateAdherenceStats(doses, "weekly");
  const upcomingAppointments = appointments.filter(
    (a) => a.status === "SCHEDULED" && a.appointmentDate >= startDateStr
  );
  const missedDosesList = doses.filter((d) => d.status === "MISSED");
  const pendingDosesList = doses.filter((d) => d.status === "PENDING");

  const executiveSummary = `During the care period from ${startDateStr} to ${endDateStr}, ${
    patient.fullName
  } had ${stats.totalScheduled} scheduled medication doses. ${
    stats.confirmedTaken
  } doses were self-reported as taken (${stats.adherencePercentage}% adherence). ${
    stats.missed
  } doses were recorded as missed or unconfirmed, and ${
    stats.pending
  } doses remain pending. There are ${
    upcomingAppointments.length
  } upcoming doctor appointments scheduled.`;

  const adherenceAnalysis = `Overall adherence stands at ${stats.adherencePercentage}%. ${
    stats.confirmedTaken
  } of ${stats.confirmedTaken + stats.missed} eligible doses were confirmed taken on schedule.`;

  const missedDoseReview =
    missedDosesList.length > 0
      ? `Review identified ${missedDosesList.length} unconfirmed doses: ${missedDosesList
          .map(
            (d) =>
              `${d.medicationName} (${d.dosage}) on ${d.scheduledTime.slice(0, 10)}`
          )
          .join(", ")}. Escalation protocol alerted the care team accordingly.`
      : "No missed medication doses were recorded during this period. Routine was maintained as scheduled.";

  const upcomingAppointmentsSummary =
    upcomingAppointments.length > 0
      ? upcomingAppointments
          .map(
            (a) =>
              `${a.doctorName} (${a.specialty || "General"}) on ${
                a.appointmentDate
              } at ${a.appointmentTime} at ${a.hospitalOrClinic}. Reason: ${
                a.reasonForVisit
              }`
          )
          .join(". ")
      : "No upcoming medical visits scheduled in this period.";

  const recentCareChanges =
    activityLogs.length > 0
      ? `Recent care events include: ${activityLogs
          .slice(0, 3)
          .map((l) => `${l.action}: ${l.details}`)
          .join("; ")}.`
      : "Care regimen remained stable with no medication changes recorded.";

  const suggestedFollowUps: string[] = [];
  if (missedDosesList.length > 0) {
    suggestedFollowUps.push(
      "Conduct a gentle check-in with the patient regarding timing for missed doses."
    );
  }
  if (upcomingAppointments.length > 0) {
    suggestedFollowUps.push(
      `Prepare transportation and consultation questions for the upcoming visit with ${upcomingAppointments[0].doctorName} on ${upcomingAppointments[0].appointmentDate}.`
    );
  }
  if (stats.adherencePercentage < 80) {
    suggestedFollowUps.push(
      "Discuss adherence obstacles (e.g. pill organizer, timing adjustments) during next clinic appointment."
    );
  } else {
    suggestedFollowUps.push(
      "Maintain current reminder and check-in routine; adherence is strong."
    );
  }

  return {
    id: `summary_${patient.id}_${Date.now()}`,
    patientId: patient.id,
    generatedAt: new Date().toISOString(),
    reportingPeriodStart: startDateStr,
    reportingPeriodEnd: endDateStr,
    overallCareStatus:
      stats.adherencePercentage >= 85
        ? "STABLE"
        : stats.adherencePercentage >= 70
        ? "ATTENTION_NEEDED"
        : "NEEDS_IMMEDIATE_REVIEW",
    adherenceRate: stats.adherencePercentage,
    totalScheduledDoses: stats.totalScheduled,
    confirmedTakenDoses: stats.confirmedTaken,
    missedDoses: stats.missed,
    skippedDoses: stats.skipped,
    unconfirmedDoses: pendingDosesList.length,
    executiveSummary,
    adherenceAnalysis,
    missedDoseReview,
    upcomingAppointmentsSummary,
    recentCareChanges,
    suggestedFollowUps,
    aiModelUsed: "Deterministic Fallback Rule Engine",
    isDeterministicFallback: true,
  };
}

/**
 * Requests an AI Care Insight summary from Google Gemini API using structured prompt engineering.
 * Automatically falls back to deterministic rule engine if API key is not configured or on network error.
 */
export async function generateAICareSummary(
  patient: PatientProfile,
  doses: ScheduledDose[],
  appointments: Appointment[],
  activityLogs: ActivityLog[],
  startDateStr: string = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
  endDateStr: string = new Date().toISOString().slice(0, 10)
): Promise<AICareSummary> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "AIzaSyYourGeminiApiKeyHere") {
    return generateDeterministicSummary(
      patient,
      doses,
      appointments,
      activityLogs,
      startDateStr,
      endDateStr
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature for factual precision
      },
    });

    const stats = calculateAdherenceStats(doses, "weekly");
    const upcomingAppointments = appointments.filter(
      (a) => a.status === "SCHEDULED" && a.appointmentDate >= startDateStr
    );
    const missedDoses = doses.filter((d) => d.status === "MISSED");

    const prompt = `
You are the healthcare analytics engine for "CareLoop AI".
Generate a factual, objective care coordination summary for caregiver review.

PATIENT INFORMATION:
- Name: ${patient.fullName}
- Date of Birth: ${patient.dateOfBirth}
- Reporting Period: ${startDateStr} to ${endDateStr}

RECORDED MEDICATION DATA:
- Total Scheduled: ${stats.totalScheduled}
- Confirmed Taken: ${stats.confirmedTaken}
- Missed / Unconfirmed: ${stats.missed}
- Skipped: ${stats.skipped}
- Pending: ${stats.pending}
- Calculated Adherence: ${stats.adherencePercentage}%
- Missed Doses Details: ${JSON.stringify(
      missedDoses.map((m) => ({
        med: m.medicationName,
        dose: m.dosage,
        time: m.scheduledTime,
      }))
    )}

UPCOMING APPOINTMENTS:
${JSON.stringify(
  upcomingAppointments.map((a) => ({
    doctor: a.doctorName,
    specialty: a.specialty,
    date: a.appointmentDate,
    time: a.appointmentTime,
    reason: a.reasonForVisit,
  }))
)}

RECENT ACTIVITY LOGS:
${JSON.stringify(
  activityLogs.slice(0, 5).map((l) => ({
    action: l.action,
    details: l.details,
    time: l.timestamp,
  }))
)}

STRICT CLINICAL SAFETY RULES:
1. DO NOT provide medical diagnoses or make medical judgements.
2. DO NOT recommend dosage changes, new medications, or alter prescriptions.
3. Clearly distinguish self-reported medication events from clinical observations.
4. Only summarize the provided facts; do not fabricate numbers or appointments.
5. Provide actionable administrative follow-ups for family caregivers (e.g. appointment prep, routine check-in).

Respond strictly with a JSON object conforming to this schema:
{
  "overallCareStatus": "STABLE" | "ATTENTION_NEEDED" | "NEEDS_IMMEDIATE_REVIEW",
  "executiveSummary": "string",
  "adherenceAnalysis": "string",
  "missedDoseReview": "string",
  "upcomingAppointmentsSummary": "string",
  "recentCareChanges": "string",
  "suggestedFollowUps": ["string"]
}
`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const parsed = JSON.parse(text);

    return {
      id: `summary_${patient.id}_${Date.now()}`,
      patientId: patient.id,
      generatedAt: new Date().toISOString(),
      reportingPeriodStart: startDateStr,
      reportingPeriodEnd: endDateStr,
      overallCareStatus: parsed.overallCareStatus || "STABLE",
      adherenceRate: stats.adherencePercentage,
      totalScheduledDoses: stats.totalScheduled,
      confirmedTakenDoses: stats.confirmedTaken,
      missedDoses: stats.missed,
      skippedDoses: stats.skipped,
      unconfirmedDoses: stats.pending,
      executiveSummary: parsed.executiveSummary,
      adherenceAnalysis: parsed.adherenceAnalysis,
      missedDoseReview: parsed.missedDoseReview,
      upcomingAppointmentsSummary: parsed.upcomingAppointmentsSummary,
      recentCareChanges: parsed.recentCareChanges,
      suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps)
        ? parsed.suggestedFollowUps
        : [
            "Maintain current check-in routine.",
            "Verify appointment times with doctor.",
          ],
      aiModelUsed: "Gemini 1.5 Flash",
      isDeterministicFallback: false,
    };
  } catch (error) {
    console.warn("Gemini API call failed, falling back to deterministic engine:", error);
    return generateDeterministicSummary(
      patient,
      doses,
      appointments,
      activityLogs,
      startDateStr,
      endDateStr
    );
  }
}
