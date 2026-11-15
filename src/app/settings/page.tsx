"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/lib/db/service";
import { mockStore } from "@/lib/db/mock-store";
import {
  Settings,
  User,
  Sliders,
  Shield,
  Clock,
  CheckCircle2,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const { user, patient, currentRole, refreshData } = useAuth();

  // Settings state
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gracePeriod, setGracePeriod] = useState(15);
  const [escalationDelay, setEscalationDelay] = useState(15);
  const [enableEmail, setEnableEmail] = useState(true);
  const [enableInApp, setEnableInApp] = useState(true);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setPhoneNumber(user.phoneNumber || "");
    }
    if (patient) {
      setGracePeriod(patient.escalationSettings.gracePeriodMinutes || 15);
      setEscalationDelay(patient.escalationSettings.escalationDelayMinutes || 15);
      setEnableEmail(patient.escalationSettings.enableEmailAlerts !== false);
      setEnableInApp(patient.escalationSettings.enableInAppAlerts !== false);
    }
  }, [user, patient]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !patient) return;

    // Update user profile
    mockStore.updateDocument("users", user.id, {
      displayName,
      phoneNumber,
    });

    // Update patient escalation settings if primary caregiver
    if (currentRole === "PRIMARY_CAREGIVER") {
      mockStore.updateDocument("patients", patient.id, {
        escalationSettings: {
          ...patient.escalationSettings,
          gracePeriodMinutes: Number(gracePeriod),
          escalationDelayMinutes: Number(escalationDelay),
          enableEmailAlerts: enableEmail,
          enableInAppAlerts: enableInApp,
        },
      });
    }

    setSavedMessage(true);
    refreshData();
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center space-x-2.5">
          <Settings className="w-7 h-7 text-slate-700" />
          <span>Profile & Escalation Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal account details, role credentials, and patient escalation intervals.
        </p>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* User Account Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-navy-900 flex items-center space-x-2">
            <User className="w-5 h-5 text-care-blue" />
            <span>Account Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Active Role</label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-navy-900">
                {currentRole}
              </div>
            </div>
          </div>
        </div>

        {/* Escalation Timing Config (Primary Caregiver Role) */}
        {currentRole === "PRIMARY_CAREGIVER" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-navy-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-care-teal" />
              <span>Medication Escalation Intervals</span>
            </h2>
            <p className="text-xs text-slate-500">
              Configure grace periods and delays before notifying caregiver and escalating to family contacts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-teal"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Time after scheduled dose before alerting Primary Caregiver (Default: 15 mins).
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Escalation Delay (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={escalationDelay}
                  onChange={(e) => setEscalationDelay(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-teal"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Delay after caregiver alert before escalating to next family contact (Default: 15 mins).
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2 border-t border-slate-100 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableInApp}
                  onChange={(e) => setEnableInApp(e.target.checked)}
                  className="rounded text-care-teal focus:ring-care-teal"
                />
                <span className="font-semibold text-slate-800">Enable In-App Realtime Push Alerts</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableEmail}
                  onChange={(e) => setEnableEmail(e.target.checked)}
                  className="rounded text-care-teal focus:ring-care-teal"
                />
                <span className="font-semibold text-slate-800">Enable Email Notification Dispatches</span>
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs flex items-center space-x-2 transition shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
