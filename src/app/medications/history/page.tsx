"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/lib/db/service";
import { ScheduledDose } from "@/types";
import { History, Filter, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

export default function MedicationHistoryPage() {
  const { patient } = useAuth();
  const [doses, setDoses] = useState<ScheduledDose[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!patient) return;
      setLoading(true);
      const data = await dbService.getDoses(patient.id);
      setDoses(data.slice().reverse()); // newest first
      setLoading(false);
    }
    loadData();
  }, [patient]);

  const filteredDoses = doses.filter((d) => {
    if (statusFilter === "ALL") return true;
    return d.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center space-x-2.5">
            <History className="w-7 h-7 text-care-teal" />
            <span>Medication History Log</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete historical audit trail of taken, missed, and snoozed doses for {patient?.fullName}.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs">
          {["ALL", "TAKEN", "MISSED", "SKIPPED", "SNOOZED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                statusFilter === st
                  ? "bg-navy-900 text-white shadow-sm font-semibold"
                  : "text-slate-600 hover:text-navy-900 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-6">Scheduled Time</th>
                <th className="py-3.5 px-6">Medication</th>
                <th className="py-3.5 px-6">Dosage</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Confirmation Type</th>
                <th className="py-3.5 px-6">Notes / Escalation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDoses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No medication events found matching filter.
                  </td>
                </tr>
              ) : (
                filteredDoses.map((dose) => (
                  <tr key={dose.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      {new Date(dose.scheduledTime).toLocaleDateString()}{" "}
                      <span className="text-slate-400">
                        {new Date(dose.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-navy-900">{dose.medicationName}</td>
                    <td className="py-4 px-6">{dose.dosage}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center space-x-1 font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                          dose.status === "TAKEN"
                            ? "bg-emerald-100 text-emerald-800"
                            : dose.status === "MISSED"
                            ? "bg-red-100 text-red-800"
                            : dose.status === "SNOOZED"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {dose.status === "TAKEN" && <CheckCircle2 className="w-3 h-3" />}
                        {dose.status === "MISSED" && <XCircle className="w-3 h-3" />}
                        {dose.status === "SNOOZED" && <Clock className="w-3 h-3" />}
                        <span>{dose.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {dose.confirmationType === "SELF_REPORTED" && (
                        <span className="text-slate-600">Patient Confirmed</span>
                      )}
                      {dose.confirmationType === "VERIFIED" && (
                        <span className="text-care-teal font-semibold">Clinically Verified</span>
                      )}
                      {dose.confirmationType === "NONE" && (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {dose.takenAt && `Confirmed at ${new Date(dose.takenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                      {dose.unableToTakeReason && `Unable: ${dose.unableToTakeReason}`}
                      {dose.escalationLevel > 0 && ` • Escalation Lvl ${dose.escalationLevel}`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
