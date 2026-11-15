"use client";

import React, { useState } from "react";
import { CaregiverAlert } from "@/types";
import { AlertCircle, CheckCircle2, ShieldAlert, Clock, ArrowRight } from "lucide-react";
import { dbService } from "@/lib/db/service";
import { useAuth } from "@/context/AuthContext";

interface ActiveAlertPanelProps {
  alerts: CaregiverAlert[];
  onAlertUpdated: () => void;
}

export default function ActiveAlertPanel({ alerts, onAlertUpdated }: ActiveAlertPanelProps) {
  const { user, currentRole } = useAuth();
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [ackNotes, setAckNotes] = useState("");

  const unresolvedAlerts = alerts.filter((a) => a.status !== "RESOLVED");

  if (unresolvedAlerts.length === 0) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900">All Care Alerts Resolved</h4>
            <p className="text-xs text-emerald-700">
              No active missed medication escalations. All patient routines are up to date.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
          Status: Clear
        </span>
      </div>
    );
  }

  const handleAcknowledge = async (alertId: string) => {
    try {
      await dbService.acknowledgeAlert(
        alertId,
        user?.id || "caregiver",
        ackNotes || "Caregiver acknowledged alert via dashboard."
      );
      setAcknowledgingId(null);
      setAckNotes("");
      onAlertUpdated();
    } catch (e: any) {
      alert(`Error acknowledging alert: ${e.message}`);
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {unresolvedAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-2xl border p-5 shadow-sm transition-all ${
            alert.status === "ESCALATED"
              ? "bg-red-50 border-red-300"
              : alert.acknowledged
              ? "bg-amber-50/60 border-amber-200"
              : "bg-red-50/60 border-red-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3.5">
              <div
                className={`p-2.5 rounded-xl ${
                  alert.status === "ESCALATED"
                    ? "bg-red-600 text-white animate-pulse"
                    : alert.acknowledged
                    ? "bg-amber-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-base font-bold text-slate-900">
                    {alert.medicationName} ({alert.dosage})
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      alert.status === "ESCALATED"
                        ? "bg-red-200 text-red-900"
                        : alert.acknowledged
                        ? "bg-amber-200 text-amber-900"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Scheduled for: {new Date(alert.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •
                  Escalation Level: <strong className="text-slate-900">{alert.currentEscalationIndex + 1}</strong>
                </p>
                {alert.acknowledged && (
                  <p className="text-xs text-amber-800 font-medium mt-1">
                    ✓ Acknowledged by caregiver at {new Date(alert.acknowledgedAt || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. (Awaiting patient confirmation).
                  </p>
                )}
              </div>
            </div>

            {/* Acknowledge Action (Caregiver role or Family) */}
            <div>
              {!alert.acknowledged && (
                <div className="flex items-center space-x-2">
                  {acknowledgingId === alert.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Add acknowledgment note..."
                        value={ackNotes}
                        onChange={(e) => setAckNotes(e.target.value)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="bg-care-teal hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setAcknowledgingId(null)}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAcknowledgingId(alert.id)}
                      className="bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-sm flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-care-teal" />
                      <span>Acknowledge Alert</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Escalation Timeline Component */}
          <div className="mt-4 pt-3 border-t border-slate-200/80">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Escalation Protocol Timeline
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center space-x-1 font-medium text-slate-900">
                <Clock className="w-3.5 h-3.5 text-care-blue" />
                <span>{new Date(alert.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}: Reminder Generated</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <div className="flex items-center space-x-1 font-medium text-amber-700">
                <span>Grace Period Expired: Caregiver Alerted</span>
              </div>
              {alert.acknowledged && (
                <>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <div className="flex items-center space-x-1 font-medium text-care-teal">
                    <span>Caregiver Acknowledged</span>
                  </div>
                </>
              )}
              {alert.status === "ESCALATED" && (
                <>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <div className="flex items-center space-x-1 font-bold text-red-700">
                    <span>Escalated to Family Contacts</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
