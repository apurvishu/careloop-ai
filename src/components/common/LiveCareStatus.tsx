"use client";

import React from "react";
import { ScheduledDose, Appointment, CaregiverAlert } from "@/types";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Activity,
  PlusCircle,
  ShieldAlert,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

interface LiveCareStatusProps {
  doses: ScheduledDose[];
  alerts: CaregiverAlert[];
  appointments: Appointment[];
  adherencePercentage: number;
}

export default function LiveCareStatus({
  doses,
  alerts,
  appointments,
  adherencePercentage,
}: LiveCareStatusProps) {
  const activeAlerts = alerts.filter((a) => a.status !== "RESOLVED");
  const pendingDoses = doses.filter((d) => d.status === "PENDING" || d.status === "SNOOZED");
  const upcomingAppointments = appointments.filter((a) => a.status === "SCHEDULED");

  // Determine current live care state
  let statusBadge = {
    title: "All Caught Up",
    desc: "All scheduled medications for today have been confirmed.",
    color: "bg-emerald-500",
    textColor: "text-emerald-700",
    bgLight: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
  };

  if (activeAlerts.length > 0) {
    statusBadge = {
      title: "Caregiver Attention Required",
      desc: `${activeAlerts.length} unresolved missed medication alert(s) need review.`,
      color: "bg-red-500",
      textColor: "text-red-700",
      bgLight: "bg-red-50 border-red-200",
      icon: AlertTriangle,
    };
  } else if (pendingDoses.length > 0) {
    statusBadge = {
      title: "Medication Pending",
      desc: `${pendingDoses.length} dose(s) pending for today's schedule.`,
      color: "bg-amber-500",
      textColor: "text-amber-700",
      bgLight: "bg-amber-50 border-amber-200",
      icon: Clock,
    };
  } else if (upcomingAppointments.length > 0) {
    statusBadge = {
      title: "Upcoming Appointment",
      desc: `Next visit: ${upcomingAppointments[0].doctorName} (${upcomingAppointments[0].appointmentDate})`,
      color: "bg-care-blue",
      textColor: "text-blue-700",
      bgLight: "bg-blue-50 border-blue-200",
      icon: Calendar,
    };
  }

  const StatusIcon = statusBadge.icon;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Live Care Status Card */}
      <div className={`p-5 rounded-2xl border ${statusBadge.bgLight} flex items-start space-x-4 shadow-sm`}>
        <div className={`p-3 rounded-xl ${statusBadge.color} text-white shadow-sm flex-shrink-0`}>
          <StatusIcon className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Live Care Status
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-0.5">{statusBadge.title}</h4>
          <p className="text-xs text-slate-600 mt-1">{statusBadge.desc}</p>
        </div>
      </div>

      {/* Adherence Score Card */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            7-Day Adherence Score
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-navy-900">{adherencePercentage}%</span>
            <span className="text-xs text-emerald-600 font-semibold">
              {adherencePercentage >= 80 ? "On Track" : "Needs Review"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Based on confirmed vs scheduled doses</p>
        </div>
        <div className="relative h-16 w-16 flex items-center justify-center">
          {/* Circular Progress Ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={adherencePercentage >= 80 ? "text-emerald-500" : "text-amber-500"}
              strokeDasharray={`${adherencePercentage}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <Activity className="w-5 h-5 absolute text-slate-700" />
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Care Ecosystem Actions
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link
            href="/medications"
            className="flex items-center space-x-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium transition"
          >
            <PlusCircle className="w-4 h-4 text-care-teal" />
            <span className="truncate">Add Medicine</span>
          </Link>
          <Link
            href="/appointments"
            className="flex items-center space-x-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium transition"
          >
            <Calendar className="w-4 h-4 text-care-blue" />
            <span className="truncate">Schedule Visit</span>
          </Link>
          <Link
            href="/family"
            className="flex items-center space-x-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium transition"
          >
            <UserPlus className="w-4 h-4 text-purple-600" />
            <span className="truncate">Invite Family</span>
          </Link>
          <Link
            href="/emergency"
            className="flex items-center space-x-1.5 p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold transition"
          >
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span className="truncate">Emergency Card</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
