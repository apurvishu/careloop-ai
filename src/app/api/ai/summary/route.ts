import { NextRequest, NextResponse } from "next/server";
import { generateAICareSummary } from "@/lib/gemini/client";
import { dbService } from "@/lib/db/service";
import { DEMO_PATIENT_ID } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const patientId = body.patientId || DEMO_PATIENT_ID;

    const [patient, doses, appointments, activityLogs] = await Promise.all([
      dbService.getPatient(patientId),
      dbService.getDoses(patientId),
      dbService.getAppointments(patientId),
      dbService.getActivityLogs(patientId),
    ]);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const startDateStr = body.startDate || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const endDateStr = body.endDate || new Date().toISOString().slice(0, 10);

    const summary = await generateAICareSummary(
      patient,
      doses,
      appointments,
      activityLogs,
      startDateStr,
      endDateStr
    );

    // Save generated summary into database
    await dbService.saveSummary(summary);

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error("AI summary generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI care summary" },
      { status: 500 }
    );
  }
}
