import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/db/mock-store";
import { dbService } from "@/lib/db/service";
import {
  evaluateDosesAndEscalate,
  generateDailyDoses,
} from "@/lib/escalation/engine";
import { PatientProfile, ScheduledDose, CaregiverAlert } from "@/types";

export async function POST(req: NextRequest) {
  return handleWorkerRun(req);
}

export async function GET(req: NextRequest) {
  return handleWorkerRun(req);
}

async function handleWorkerRun(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "careloop-hackathon-demo-cron-secret-key-12345";

  // Check auth if configured (Bearer token or CRON_SECRET)
  if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET) {
    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      req.headers.get("x-cron-secret") === cronSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized cron invocation" }, { status: 401 });
    }
  }

  const nowIso = new Date().toISOString();
  const summary = {
    processedPatients: 0,
    generatedDoses: 0,
    updatedDoses: 0,
    newAlerts: 0,
    updatedAlerts: 0,
    notificationsGenerated: 0,
    appointmentRemindersGenerated: 0,
    executedAt: nowIso,
  };

  try {
    const allPatients = Object.values(mockStore.getCollection("patients"));
    const allMeds = mockStore.getCollection("medications");

    for (const patient of allPatients) {
      summary.processedPatients++;

      // 1. Generate today's doses if not already created
      const patientMeds = Object.values(allMeds).filter((m) => m.patientId === patient.id);
      const dailyDoses = generateDailyDoses(
        patient.id,
        patientMeds,
        new Date(),
        patient.escalationSettings.gracePeriodMinutes || 15
      );

      for (const d of dailyDoses) {
        // Prevent duplicate creation
        if (!mockStore.getDocument("scheduledDoses", d.id)) {
          mockStore.setDocument("scheduledDoses", d.id, d);
          summary.generatedDoses++;
        }
      }

      // 2. Fetch current doses and alerts for evaluation
      const currentDoses = await dbService.getDoses(patient.id);
      const currentAlerts = await dbService.getAlerts(patient.id);

      // 3. Run deterministic escalation engine
      const evalResult = evaluateDosesAndEscalate(patient, currentDoses, currentAlerts, nowIso);

      // Persist results
      for (const d of evalResult.updatedDoses) {
        mockStore.setDocument("scheduledDoses", d.id, d);
        summary.updatedDoses++;
      }
      for (const a of evalResult.newAlerts) {
        mockStore.setDocument("caregiverAlerts", a.id, a);
        summary.newAlerts++;
      }
      for (const a of evalResult.updatedAlerts) {
        mockStore.setDocument("caregiverAlerts", a.id, a);
        summary.updatedAlerts++;
      }
      for (const n of evalResult.notifications) {
        // Prevent duplicate notifications by unique ID
        if (!mockStore.getDocument("notifications", n.id)) {
          mockStore.setDocument("notifications", n.id, n);
          summary.notificationsGenerated++;
        }
      }
      for (const l of evalResult.activityLogs) {
        mockStore.setDocument("activityLogs", l.id, l);
      }

      // 4. Process Appointment Reminders (24h before visit)
      const appointments = await dbService.getAppointments(patient.id);
      const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      for (const apt of appointments) {
        if (
          apt.status === "SCHEDULED" &&
          apt.appointmentDate === tomorrowStr &&
          apt.reminderPreferences.remind24hBefore
        ) {
          const notifId = `notif_apt_24h_${apt.id}`;
          if (!mockStore.getDocument("notifications", notifId)) {
            mockStore.setDocument("notifications", notifId, {
              id: notifId,
              userId: patient.primaryCaregiverId,
              patientId: patient.id,
              title: `Upcoming Appointment Tomorrow: ${patient.fullName}`,
              message: `${patient.fullName} has an appointment with ${apt.doctorName} (${apt.hospitalOrClinic}) tomorrow at ${apt.appointmentTime}. Reason: ${apt.reasonForVisit}`,
              type: "APPOINTMENT_REMINDER",
              referenceId: apt.id,
              read: false,
              deliveryStatus: "DELIVERED",
              createdAt: nowIso,
            });
            summary.appointmentRemindersGenerated++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "CareLoop reminder and escalation worker executed successfully",
      summary,
    });
  } catch (error: any) {
    console.error("Worker execution failed:", error);
    return NextResponse.json(
      { error: error.message || "Reminder worker failed", summary },
      { status: 500 }
    );
  }
}
