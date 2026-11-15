"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { HeartHandshake, ArrowRight, UserCheck, Mail, Lock, User, Phone } from "lucide-react";
import { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { loginAs } = useAuth();

  const [role, setRole] = useState<UserRole>("PRIMARY_CAREGIVER");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "PATIENT") {
      loginAs("user_patient_eleanor");
      router.push("/onboarding/patient");
    } else {
      loginAs("user_caregiver_david");
      router.push("/onboarding/caregiver");
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-care-teal to-care-blue mx-auto flex items-center justify-center text-white shadow-md">
          <HeartHandshake className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-navy-900">Create CareLoop Account</h1>
        <p className="text-xs text-slate-500">
          Join the intelligent elderly care and safety ecosystem
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        {/* Role Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select Your Primary Role
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { id: "PRIMARY_CAREGIVER", label: "Caregiver" },
              { id: "PATIENT", label: "Patient (Senior)" },
              { id: "FAMILY_MEMBER", label: "Family" },
            ].map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => setRole(r.id as any)}
                className={`py-2 px-1 rounded-xl font-bold transition text-center ${
                  role === r.id
                    ? "bg-navy-900 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. David Vance"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="caregiver@careloop.local"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 345-6789"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-care-teal to-care-blue hover:from-teal-600 hover:to-blue-600 text-white font-bold transition shadow-md flex items-center justify-center space-x-2 text-sm"
          >
            <span>Proceed to Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-care-blue font-bold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
