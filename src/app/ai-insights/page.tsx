"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AICareSummary } from "@/types";
import { dbService } from "@/lib/db/service";
import {
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListFilter,
  FileCheck,
} from "lucide-react";

export default function AICareInsightsPage() {
  const { patient } = useAuth();
  const [summary, setSummary] = useState<AICareSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadLatestSummary = async () => {
    if (!patient) return;
    setLoading(true);
    const existing = await dbService.getLatestSummary(patient.id);
    if (existing) {
      setSummary(existing);
    } else {
      // Auto-generate on first visit
      await handleGenerateSummary();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLatestSummary();
  }, [patient]);

  const handleGenerateSummary = async () => {
    if (!patient) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id }),
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (e) {
      console.error("Failed to generate summary:", e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-care-teal/10 text-care-teal text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini Healthcare Synthesis Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            AI Care Insights & Routine Brief
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Objective, clinical-safe synthesis of {patient?.fullName}&apos;s adherence trends and care follow-ups.
          </p>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={generating}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-care-teal to-care-blue hover:from-teal-600 hover:to-blue-600 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
          <span>{generating ? "Analyzing Records..." : "Regenerate Insight"}</span>
        </button>
      </div>

      {/* Strict Clinical Safety Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-1 shadow-md">
        <div className="flex items-center space-x-2 text-care-teal font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Clinical Safety Architecture</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          This AI module is constrained strictly to administrative summarization and caregiver follow-up suggestions. It does not provide medical diagnoses, alter prescriptions, or suggest dosage changes.
        </p>
      </div>

      {summary && (
        <div className="space-y-6">
          {/* Metadata pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-600 shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-slate-900">
                Reporting Window: {summary.reportingPeriodStart} to {summary.reportingPeriodEnd}
              </span>
              <span>•</span>
              <span className="text-slate-500">
                Generated: {new Date(summary.generatedAt).toLocaleDateString()}{" "}
                {new Date(summary.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-semibold px-2 py-0.5 rounded">
                Model: {summary.aiModelUsed}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  summary.overallCareStatus === "STABLE"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                STATUS: {summary.overallCareStatus}
              </span>
            </div>
          </div>

          {/* 6 Structured Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Executive Summary */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-navy-900 flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-care-teal" />
                <span>1. Overall Care Activity & Summary</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{summary.executiveSummary}</p>
            </div>

            {/* 2. Medication Adherence */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-navy-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>2. Medication Adherence Analysis</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{summary.adherenceAnalysis}</p>
              <div className="pt-2 flex items-center space-x-4 text-xs font-semibold">
                <span className="text-emerald-700">{summary.confirmedTakenDoses} Taken</span>
                <span className="text-red-600">{summary.missedDoses} Missed</span>
                <span className="text-amber-600">{summary.unconfirmedDoses} Pending</span>
              </div>
            </div>

            {/* 3. Missed or Unconfirmed Doses */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-navy-900 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>3. Missed or Unconfirmed Doses Review</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{summary.missedDoseReview}</p>
            </div>

            {/* 4. Upcoming Appointments */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-navy-900 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-care-blue" />
                <span>4. Upcoming Doctor Appointments</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {summary.upcomingAppointmentsSummary}
              </p>
            </div>

            {/* 5. Recent Care Changes */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-navy-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>5. Recent Routine & Schedule Changes</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{summary.recentCareChanges}</p>
            </div>

            {/* 6. Suggested Administrative Follow-ups */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-navy-900 flex items-center space-x-2">
                <ListFilter className="w-4 h-4 text-care-teal" />
                <span>6. Suggested Caregiver Follow-Ups</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {summary.suggestedFollowUps.map((action, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="h-5 w-5 rounded-full bg-teal-50 text-care-teal font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
