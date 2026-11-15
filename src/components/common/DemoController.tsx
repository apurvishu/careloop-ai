"use client";

import React, { useState } from "react";
import {
  PlayCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { mockStore } from "@/lib/db/mock-store";
import { evaluateDosesAndEscalate } from "@/lib/escalation/engine";
import { dbService } from "@/lib/db/service";

export default function DemoController({ onStateChange }: { onStateChange?: () => void }) {
  const { patient, refreshData } = useAuth();
  const [isRunningWorker, setIsRunningWorker] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 1. Simulate Missed Dose (rewinds scheduled time past the 15-minute grace period)
  const handleSimulateMissedDose = async () => {
    if (!patient) return;
    setStatusMessage("Simulating missed dose: shifting dose time past grace period...");

    const doses = await dbService.getDoses(patient.id);
    const pendingDose = doses.find((d) => d.status === "PENDING");

    if (pendingDose) {
      // Set scheduled time to 25 minutes ago
      const pastTime = new Date(Date.now() - 25 * 60 * 1000).toISOString();
      const pastGrace = new Date(Date.now() - 10 * 60 * 1000).toISOString();

      mockStore.updateDocument("scheduledDoses", pendingDose.id, {
        scheduledTime: pastTime,
        gracePeriodDeadline: pastGrace,
        caregiverAlertGenerated: false,
        escalationLevel: 0,
      });

      setStatusMessage(`Dose '${pendingDose.medicationName}' rewound to 25 mins ago. Click 'Run Escalation Engine' to trigger Stage 1 Alert.`);
      if (onStateChange) onStateChange();
      refreshData();
    } else {
      setStatusMessage("No pending dose available to rewind. Try resetting demo data first.");
    }
  };

  // 2. Run Escalation Engine / Reminder Worker
  const handleRunEscalationEngine = async () => {
    if (!patient) return;
    setIsRunningWorker(true);
    setStatusMessage("Running backend escalation worker...");

    try {
      const doses = await dbService.getDoses(patient.id);
      const alerts = await dbService.getAlerts(patient.id);

      const evaluation = evaluateDosesAndEscalate(patient, doses, alerts, new Date().toISOString());

      // Persist results into database
      for (const d of evaluation.updatedDoses) {
        mockStore.setDocument("scheduledDoses", d.id, d);
      }
      for (const a of evaluation.newAlerts) {
        mockStore.setDocument("caregiverAlerts", a.id, a);
      }
      for (const a of evaluation.updatedAlerts) {
        mockStore.setDocument("caregiverAlerts", a.id, a);
      }
      for (const n of evaluation.notifications) {
        mockStore.setDocument("notifications", n.id, n);
      }
      for (const l of evaluation.activityLogs) {
        mockStore.setDocument("activityLogs", l.id, l);
      }

      const alertCount = evaluation.newAlerts.length + evaluation.updatedAlerts.length;
      setStatusMessage(
        `Worker completed! Generated ${alertCount} alert(s) and ${evaluation.notifications.length} notification(s). Escalation chain active.`
      );
      if (onStateChange) onStateChange();
      refreshData();
    } catch (e: any) {
      setStatusMessage(`Worker error: ${e.message}`);
    } finally {
      setIsRunningWorker(false);
    }
  };

  // 3. Simulate Escalation to next family member (advances alert time past escalation delay)
  const handleSimulateNextFamilyEscalation = async () => {
    if (!patient) return;
    const alerts = await dbService.getAlerts(patient.id);
    const pendingAlert = alerts.find((a) => !a.acknowledged && a.status !== "RESOLVED");

    if (pendingAlert) {
      // Set lastEscalatedAt to 20 minutes ago
      const pastTime = new Date(Date.now() - 20 * 60 * 1000).toISOString();
      mockStore.updateDocument("caregiverAlerts", pendingAlert.id, {
        lastEscalatedAt: pastTime,
      });

      setStatusMessage("Alert timestamp pushed back 20 mins. Running escalation engine to alert next family member...");
      await handleRunEscalationEngine();
    } else {
      setStatusMessage("No unacknowledged caregiver alert found. First simulate a missed dose.");
    }
  };

  // 4. Reset Demo Data
  const handleResetDemoData = () => {
    mockStore.resetToInitial();
    setStatusMessage("Demo database reset to clean default state.");
    if (onStateChange) onStateChange();
    refreshData();
  };

  return (
    <div className="bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 border border-care-blue/40 rounded-2xl p-4 text-white shadow-xl mb-6 no-print">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-care-teal text-navy-950 font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
              Hackathon Evaluation Bar
            </span>
            <h3 className="font-bold text-sm sm:text-base text-white">
              Live Medication Escalation Engine Controller
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Demonstrate the multi-stage escalation protocol in seconds: simulate patient delay, run Cloud Scheduler worker, observe caregiver alert and family escalation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulateMissedDose}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>1. Simulate Missed Dose</span>
          </button>

          <button
            onClick={handleRunEscalationEngine}
            disabled={isRunningWorker}
            className="px-3 py-1.5 rounded-xl bg-care-blue hover:bg-blue-600 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow"
          >
            <PlayCircle className={`w-3.5 h-3.5 ${isRunningWorker ? "animate-spin" : ""}`} />
            <span>2. Run Escalation Engine</span>
          </button>

          <button
            onClick={handleSimulateNextFamilyEscalation}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>3. Escalate to Family</span>
          </button>

          <button
            onClick={handleResetDemoData}
            title="Reset database to default state"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mt-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-care-tealLight flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white ml-2 text-xs">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
