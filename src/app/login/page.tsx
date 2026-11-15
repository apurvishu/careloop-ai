"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { HeartHandshake, ArrowRight, UserCheck, ShieldCheck, Mail, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const { loginAs } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs("user_caregiver_david");
    router.push("/dashboard");
  };

  const handleQuickLogin = (userId: string) => {
    loginAs(userId);
    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-care-teal to-care-blue mx-auto flex items-center justify-center text-white shadow-md">
          <HeartHandshake className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-navy-900">Sign in to CareLoop AI</h1>
        <p className="text-xs text-slate-500">
          Enter your care credentials or use one-click demo profiles below
        </p>
      </div>

      {inviteToken && (
        <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span>Single-use family invitation detected! Sign in or select a demo account to join the care team.</span>
        </div>
      )}

      {/* Login Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-care-blue hover:underline text-[11px]">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-care-teal to-care-blue hover:from-teal-600 hover:to-blue-600 text-white font-bold transition shadow-md flex items-center justify-center space-x-2 text-sm"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-care-blue font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>

      {/* Instant Demo Role Access Cards */}
      <div className="bg-slate-100 rounded-3xl p-5 border border-slate-200 space-y-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center">
          Judge & Hackathon Instant Logins
        </span>
        <div className="space-y-2">
          <button
            onClick={() => handleQuickLogin("user_caregiver_david")}
            className="w-full p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-left flex items-center justify-between text-xs transition shadow-sm"
          >
            <div>
              <span className="font-bold text-slate-900 block">David Vance</span>
              <span className="text-[11px] text-slate-500">Primary Caregiver (Full Admin View)</span>
            </div>
            <UserCheck className="w-4 h-4 text-care-blue" />
          </button>

          <button
            onClick={() => handleQuickLogin("user_patient_eleanor")}
            className="w-full p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-left flex items-center justify-between text-xs transition shadow-sm"
          >
            <div>
              <span className="font-bold text-slate-900 block">Eleanor Vance</span>
              <span className="text-[11px] text-slate-500">Elderly Senior (Patient View)</span>
            </div>
            <UserCheck className="w-4 h-4 text-care-teal" />
          </button>

          <button
            onClick={() => handleQuickLogin("user_family_sarah")}
            className="w-full p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-left flex items-center justify-between text-xs transition shadow-sm"
          >
            <div>
              <span className="font-bold text-slate-900 block">Sarah Vance</span>
              <span className="text-[11px] text-slate-500">Authorized Family Member (Tier 2 Escalations)</span>
            </div>
            <UserCheck className="w-4 h-4 text-purple-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-sm">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
