"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { mockStore } from "@/lib/db/mock-store";
import { User, Calendar, Heart, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

export default function PatientOnboardingPage() {
  const router = useRouter();
  const { loginAs, refreshData } = useAuth();

  const [fullName, setFullName] = useState("Eleanor Vance");
  const [dateOfBirth, setDateOfBirth] = useState("1948-04-12");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [timeZone, setTimeZone] = useState("Asia/Kolkata");
  const [primaryPhone, setPrimaryPhone] = useState("+1 (555) 234-5678");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs("user_patient_eleanor");
    refreshData();
    router.push("/dashboard");
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-care-teal uppercase tracking-widest">
          Step 1 of 1 • Senior Setup
        </span>
        <h1 className="text-2xl font-extrabold text-navy-900">
          Welcome to CareLoop AI, Senior
        </h1>
        <p className="text-xs text-slate-500">
          Let&apos;s personalize your medication reminders and emergency contacts.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-teal text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-teal"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Type</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Your Phone Number</label>
            <input
              type="tel"
              required
              value={primaryPhone}
              onChange={(e) => setPrimaryPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-teal"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Time Zone (For Reminders)</label>
            <input
              type="text"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-teal"
            />
          </div>

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 space-y-1">
            <span className="font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-care-teal" />
              <span>Voice Assistant & Large Font Pre-Activated</span>
            </span>
            <p className="text-[11px] text-teal-800">
              Your profile is automatically configured with audio read-aloud and large-touch targets for easy daily use.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-care-teal to-care-blue hover:from-teal-600 hover:to-blue-600 text-white font-bold transition shadow-md flex items-center justify-center space-x-2 text-sm"
          >
            <span>Complete Setup & Open Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
