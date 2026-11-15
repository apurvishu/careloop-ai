"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Heart, Clock, ShieldCheck, ArrowRight } from "lucide-react";

export default function CaregiverOnboardingPage() {
  const router = useRouter();
  const { loginAs, refreshData } = useAuth();

  const [patientName, setPatientName] = useState("Eleanor Vance");
  const [relationship, setRelationship] = useState("Son");
  const [gracePeriod, setGracePeriod] = useState(15);
  const [escalationDelay, setEscalationDelay] = useState(15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs("user_caregiver_david");
    refreshData();
    router.push("/dashboard");
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-care-blue uppercase tracking-widest">
          Step 1 of 1 • Caregiver Protocol
        </span>
        <h1 className="text-2xl font-extrabold text-navy-900">
          Caregiver Ecosystem Setup
        </h1>
        <p className="text-xs text-slate-500">
          Set up your loved one&apos;s care profile and emergency escalation rules.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Patient Full Name (Senior) *
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Your Relationship to Patient *
            </label>
            <input
              type="text"
              required
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Son, Daughter, Professional Nurse"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Grace Period (Minutes) *
              </label>
              <input
                type="number"
                min={5}
                max={120}
                required
                value={gracePeriod}
                onChange={(e) => setGracePeriod(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Time before alerting you if dose is unconfirmed (Default: 15m).
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Escalation Delay (Minutes) *
              </label>
              <input
                type="number"
                min={5}
                max={120}
                required
                value={escalationDelay}
                onChange={(e) => setEscalationDelay(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Time before alerting family fallback contacts (Default: 15m).
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
            <span className="font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-care-blue" />
              <span>Smart Escalation Ready</span>
            </span>
            <p className="text-[11px] text-blue-800 leading-snug">
              If Eleanor confirms taking medicine, escalation stops immediately. Acknowledging an alert informs the team but does not mark medication as taken.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-care-teal to-care-blue hover:from-teal-600 hover:to-blue-600 text-white font-bold transition shadow-md flex items-center justify-center space-x-2 text-sm"
          >
            <span>Launch Caregiver Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
