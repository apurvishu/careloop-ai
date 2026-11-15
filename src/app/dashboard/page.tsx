"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/lib/db/service";
import {
  ScheduledDose,
  Appointment,
  CaregiverAlert,
  ActivityLog,
} from "@/types";
import { calculateAdherenceStats } from "@/lib/adherence/calculator";
import LiveCareStatus from "@/components/common/LiveCareStatus";
import ActiveAlertPanel from "@/components/common/ActiveAlertPanel";
import DemoController from "@/components/common/DemoController";
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { patient, user, currentRole } = useAuth();
  const [doses, setDoses] = useState<ScheduledDose[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [alerts, setAlerts] = useState<CaregiverAlert[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / action state for Reporting Unable to Take
  const [unableModalDose, setUnableModalDose] = useState<ScheduledDose | null>(null);
  const [unableReason, setUnableReason] = useState("");

  const loadData = async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const [d, a, al, l] = await Promise.all([
        dbService.getDoses(patient.id),
        dbService.getAppointments(patient.id),
        dbService.getAlerts(patient.id),
        dbService.getActivityLogs(patient.id),
      ]);
      setDoses(d);
      setAppointments(a);
      setAlerts(al);
      setActivityLogs(l);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patient]);

  // Actions
  const handleMarkTaken = async (doseId: string) => {
    if (!user) return;
    await dbService.markDoseTaken(doseId, user.id, "SELF_REPORTED");
    loadData();
  };

  const handleSnooze = async (doseId: string) => {
    if (!user) return;
    await dbService.snoozeDose(doseId, user.id, 15);
    loadData();
  };

  const handleSkip = async (doseId: string) => {
    if (!user) return;
    await dbService.skipDose(doseId, user.id, "Patient opted to skip dose");
    loadData();
  };

  const handleConfirmUnableToTake = async () => {
    if (!unableModalDose || !user) return;
    await dbService.reportUnableToTake(
      unableModalDose.id,
      user.id,
      unableReason || "Patient experienced nausea/difficulty swallowing"
    );
    setUnableModalDose(null);
    setUnableReason("");
    loadData();
  };

  const stats = calculateAdherenceStats(doses, "weekly");
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDoses = doses.filter((d) => d.scheduledTime.startsWith(todayStr));

  return (
    <div className="space-y-6">
      {/* Hackathon Live Demo Evaluation Controller */}
      <DemoController onStateChange={loadData} />

      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Care Ecosystem Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoring schedule and safety for <strong className="text-slate-800">{patient?.fullName}</strong>. Viewing as <span className="font-semibold text-care-blue">{currentRole}</span>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/ai-insights"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-care-teal to-care-blue hover:from-teal-600 hover:to-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI Insights</span>
          </Link>
        </div>
      </div>

      {/* Active Alert Escalation Banner */}
      <ActiveAlertPanel alerts={alerts} onAlertUpdated={loadData} />

      {/* Live Care Status, Adherence Ring, Quick Actions */}
      <LiveCareStatus
        doses={doses}
        alerts={alerts}
        appointments={appointments}
        adherencePercentage={stats.adherencePercentage}
      />

      {/* Today's Care Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-navy-900">Today&apos;s Medication Timeline</h2>
              <p className="text-xs text-slate-500">
                Chronological doses with confirmation status and real-time escalation controls
              </p>
            </div>
            <Link
              href="/medications"
              className="text-xs font-semibold text-care-blue hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayDoses.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No scheduled medications recorded for today.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {todayDoses.map((dose) => {
                const isTaken = dose.status === "TAKEN";
                const isMissed = dose.status === "MISSED";
                const isSnoozed = dose.status === "SNOOZED";
                const isPending = dose.status === "PENDING";

                return (
                  <div
                    key={dose.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div
                        className={`p-2.5 rounded-2xl flex-shrink-0 ${
                          isTaken
                            ? "bg-emerald-100 text-emerald-600"
                            : isMissed
                            ? "bg-red-100 text-red-600"
                            : isSnoozed
                            ? "bg-amber-100 text-amber-600"
                            : "bg-blue-100 text-care-blue"
                        }`}
                      >
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900">{dose.medicationName}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isTaken
                                ? "bg-emerald-100 text-emerald-800"
                                : isMissed
                                ? "bg-red-100 text-red-800"
                                : isSnoozed
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {dose.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Dosage: <strong>{dose.dosage}</strong> • Scheduled:{" "}
                          <strong>
                            {new Date(dose.scheduledTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </strong>
                        </p>
                        {isTaken && (
                          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                            ✓ Self-reported taken at{" "}
                            {new Date(dose.takenAt || "").toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                        {dose.unableToTakeReason && (
                          <p className="text-[11px] text-red-600 font-semibold mt-0.5">
                            Unable to take: {dose.unableToTakeReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Dose Actions */}
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      {!isTaken && (
                        <>
                          <button
                            onClick={() => handleMarkTaken(dose.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Taken</span>
                          </button>
                          <button
                            onClick={() => handleSnooze(dose.id)}
                            title="Snooze for 15 minutes"
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center space-x-1"
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Snooze</span>
                          </button>
                          <button
                            onClick={() => setUnableModalDose(dose)}
                            title="Report inability to take"
                            className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition"
                          >
                            Unable
                          </button>
                        </>
                      )}
                      {isTaken && (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirmed</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Appointments & Recent Activity */}
        <div className="space-y-6">
          {/* Upcoming Appointments Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-care-blue" />
                <span>Upcoming Appointments</span>
              </h3>
              <Link href="/appointments" className="text-xs text-care-blue hover:underline">
                View all
              </Link>
            </div>

            {appointments.filter((a) => a.status === "SCHEDULED").length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No upcoming appointments scheduled.</p>
            ) : (
              <div className="space-y-3">
                {appointments
                  .filter((a) => a.status === "SCHEDULED")
                  .slice(0, 2)
                  .map((apt) => (
                    <div key={apt.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{apt.doctorName}</span>
                        <span className="text-[10px] font-semibold text-care-blue bg-blue-50 px-2 py-0.5 rounded-full">
                          {apt.appointmentDate}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{apt.hospitalOrClinic}</p>
                      <p className="text-[11px] text-slate-600 italic">&ldquo;{apt.reasonForVisit}&rdquo;</p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Recent Activity Log Feed */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-care-teal" />
                <span>Recent Care Activity</span>
              </h3>
            </div>

            <div className="space-y-3">
              {activityLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs space-y-0.5 border-l-2 border-care-teal pl-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.action.replace(/_/g, " ")}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-snug">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Unable to Take Modal */}
      {unableModalDose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              Report Inability to Take Medicine
            </h3>
            <p className="text-xs text-slate-600">
              Reporting unable to take <strong>{unableModalDose.medicationName}</strong> will immediately alert the primary caregiver with high priority so they can assist you safely.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Symptoms
              </label>
              <textarea
                rows={3}
                value={unableReason}
                onChange={(e) => setUnableReason(e.target.value)}
                placeholder="e.g. Nausea, dizziness, difficulty swallowing..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setUnableModalDose(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnableToTake}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                Submit & Alert Caregiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
