"use client";

import React from "react";
import Link from "next/link";
import {
  HeartHandshake,
  ShieldCheck,
  BellRing,
  Sparkles,
  Users,
  Mic,
  ArrowRight,
  Pill,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-care-teal/10 border border-care-teal/20 text-care-teal text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-care-teal" />
          <span>Intelligent Elderly Care & Safety Ecosystem</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-tight">
          Caring for Seniors With <br />
          <span className="bg-gradient-to-r from-care-teal via-care-blue to-navy-900 bg-clip-text text-transparent">
            Smart Escalations & AI Insights
          </span>
        </h1>

        <blockquote className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto italic font-normal">
          &ldquo;CareLoop AI doesn&apos;t just remind elderly people to take medicine. It connects patients, caregivers, and families so important healthcare routines are less likely to be overlooked.&rdquo;
        </blockquote>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-care-teal to-care-blue hover:from-teal-600 hover:to-blue-600 text-white font-bold text-base shadow-lg shadow-teal-900/10 flex items-center justify-center space-x-2 transition"
          >
            <span>Launch Live Care Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/emergency"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-base border border-red-200 flex items-center justify-center space-x-2 transition"
          >
            <span>View Emergency Care Card</span>
          </Link>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center text-care-teal">
            <BellRing className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Multi-Tier Escalation</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            If a senior misses a dose, CareLoop alerts the primary caregiver within 15 minutes. Unacknowledged alerts automatically escalate to secondary family members.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-care-blue">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Gemini AI Care Insights</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Google Gemini synthesizes real medication logs, missed dose patterns, and upcoming appointments into clinical-safe administrative briefs for family review.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Mic className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Elderly Voice & Accessibility</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Seniors can speak natural commands like &ldquo;What medicine should I take now?&rdquo; with large high-contrast fonts, speech synthesis, and screen-reader optimizations.
          </p>
        </div>
      </section>

      {/* Role-Based Ecosystem Section */}
      <section className="bg-navy-900 text-white rounded-3xl p-8 sm:p-12 max-w-6xl mx-auto shadow-xl">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold text-care-teal tracking-widest uppercase">
            Designed for the Entire Family
          </span>
          <h2 className="text-3xl font-bold text-white">Three Purpose-Built User Experiences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-navy-800/80 p-6 rounded-2xl border border-navy-700/60 space-y-3">
            <div className="inline-block bg-teal-400/20 text-teal-300 font-bold px-2.5 py-1 rounded-md text-xs">
              PATIENT ROLE
            </div>
            <h4 className="font-bold text-lg text-white">Elderly Seniors</h4>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-care-teal flex-shrink-0" />
                <span>Large-button medication confirmation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-care-teal flex-shrink-0" />
                <span>Voice commands & audio read-aloud</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-care-teal flex-shrink-0" />
                <span>One-tap emergency medical card</span>
              </li>
            </ul>
          </div>

          <div className="bg-navy-800/80 p-6 rounded-2xl border border-navy-700/60 space-y-3">
            <div className="inline-block bg-blue-400/20 text-blue-300 font-bold px-2.5 py-1 rounded-md text-xs">
              PRIMARY CAREGIVER
            </div>
            <h4 className="font-bold text-lg text-white">Son, Daughter, or Nurse</h4>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-care-blue flex-shrink-0" />
                <span>Prescription schedule configuration</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-care-blue flex-shrink-0" />
                <span>Missed dose alert acknowledgment</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-care-blue flex-shrink-0" />
                <span>Adherence trend analysis & AI summaries</span>
              </li>
            </ul>
          </div>

          <div className="bg-navy-800/80 p-6 rounded-2xl border border-navy-700/60 space-y-3">
            <div className="inline-block bg-purple-400/20 text-purple-300 font-bold px-2.5 py-1 rounded-md text-xs">
              FAMILY MEMBER
            </div>
            <h4 className="font-bold text-lg text-white">Authorized Relatives</h4>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Second-tier escalation alerts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Upcoming appointment visibility</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Peace of mind activity stream</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Medical Disclaimer Section */}
      <footer className="text-center max-w-3xl mx-auto pt-6 border-t border-slate-200">
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong>Important Clinical & Legal Notice:</strong> CareLoop AI is an assistive care coordination ecosystem. It does not provide medical diagnoses, treatment decisions, or dosage changes. In emergency medical situations, dial 911 or your local emergency service.
        </p>
      </footer>
    </div>
  );
}
