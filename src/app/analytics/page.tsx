"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/lib/db/service";
import { ScheduledDose } from "@/types";
import { calculateAdherenceStats } from "@/lib/adherence/calculator";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Pill,
  TrendingUp,
} from "lucide-react";

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#64748b"];

export default function AdherenceAnalyticsPage() {
  const { patient } = useAuth();
  const [doses, setDoses] = useState<ScheduledDose[]>([]);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!patient) return;
      setLoading(true);
      const data = await dbService.getDoses(patient.id);
      setDoses(data);
      setLoading(false);
    }
    loadData();
  }, [patient]);

  const stats = calculateAdherenceStats(doses, period);

  // Pie chart data
  const pieData = [
    { name: "Confirmed Taken", value: stats.confirmedTaken },
    { name: "Missed", value: stats.missed },
    { name: "Pending", value: stats.pending },
    { name: "Skipped", value: stats.skipped },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center space-x-2.5">
            <Activity className="w-7 h-7 text-emerald-600" />
            <span>Medication Adherence Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time compliance calculation based on confirmed vs scheduled doses for {patient?.fullName}.
          </p>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl font-semibold capitalize transition ${
                period === p
                  ? "bg-care-teal text-white shadow-sm"
                  : "text-slate-600 hover:text-navy-900 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Adherence Rate
          </span>
          <div className="text-3xl font-extrabold text-navy-900">{stats.adherencePercentage}%</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Compliance Formula</span>
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Scheduled Doses
          </span>
          <div className="text-3xl font-extrabold text-slate-800">{stats.totalScheduled}</div>
          <span className="text-[11px] text-slate-400">Total in period</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Confirmed Taken
          </span>
          <div className="text-3xl font-extrabold text-emerald-600">{stats.confirmedTaken}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Self-reported</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Missed Doses
          </span>
          <div className="text-3xl font-extrabold text-red-600">{stats.missed}</div>
          <span className="text-[11px] text-red-600 font-medium">Escalated</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1 col-span-2 md:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Pending Doses
          </span>
          <div className="text-3xl font-extrabold text-amber-500">{stats.pending}</div>
          <span className="text-[11px] text-amber-600 font-medium">Upcoming</span>
        </div>
      </div>

      {/* Formula Explanation Note */}
      <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <span>
          <strong>Calculation Formula:</strong> Adherence = (Confirmed Taken / Eligible Doses) × 100. Pending future doses are kept visible separately and not penalized.
        </span>
        <span className="font-mono text-[11px] text-slate-500 hidden sm:inline">
          Period: {stats.period.toUpperCase()}
        </span>
      </div>

      {/* Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly / Daily Trend Line Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-navy-900">Historical Adherence Trend (%)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="adherence"
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0d9488" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dose Status Distribution Pie Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-navy-900">Dose Status Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">No dose records available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend textAnchor="middle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Individual Medication Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-navy-900">Individual Medication Compliance</h3>
        <div className="space-y-4">
          {stats.medicationBreakdown.map((item) => (
            <div key={item.medicationId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{item.medicationName}</span>
                <span className="font-semibold text-slate-600">
                  {item.taken} / {item.total} doses ({item.adherencePercentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.adherencePercentage >= 80 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${item.adherencePercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
