"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HeartHandshake, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-care-teal to-care-blue mx-auto flex items-center justify-center text-white shadow-md">
          <HeartHandshake className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-navy-900">Reset Your Password</h1>
        <p className="text-xs text-slate-500">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Reset Instructions Sent</h3>
            <p className="text-xs text-slate-600">
              We have dispatched password reset instructions to <strong>{email}</strong>. Please check your inbox.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-care-blue hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
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
                  placeholder="name@careloop.local"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold transition shadow-md text-sm"
            >
              Send Password Reset Link
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
