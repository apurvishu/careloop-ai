"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import {
  HeartHandshake,
  Bell,
  ShieldAlert,
  Volume2,
  VolumeX,
  Type,
  SunMoon,
  ChevronDown,
  User,
} from "lucide-react";
import { UserRole } from "@/types";

export default function Navbar() {
  const { user, patient, currentRole, switchRole } = useAuth();
  const {
    largeText,
    highContrast,
    voiceEnabled,
    toggleLargeText,
    toggleHighContrast,
    toggleVoice,
  } = useAccessibility();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-navy-900 border-b border-navy-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-care-teal to-care-blue flex items-center justify-center shadow-md">
              <HeartHandshake className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-care-tealLight transition-colors">
                CareLoop <span className="text-care-teal">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-300 border-l border-navy-800 pl-2">
                Elderly Care Ecosystem
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Right Control actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Active Patient Indicator */}
          {patient && (
            <div className="hidden md:flex items-center space-x-2 bg-navy-800/80 px-3 py-1.5 rounded-lg border border-navy-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-300">Care for:</span>
              <span className="text-xs font-semibold text-white">{patient.fullName}</span>
            </div>
          )}

          {/* Accessibility Quick Toggles */}
          <div className="flex items-center space-x-1 bg-navy-800/60 p-1 rounded-lg border border-navy-700/50">
            <button
              onClick={toggleLargeText}
              title="Toggle Large Fonts (A+)"
              className={`p-1.5 rounded transition ${
                largeText ? "bg-care-blue text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              onClick={toggleHighContrast}
              title="Toggle High Contrast"
              className={`p-1.5 rounded transition ${
                highContrast ? "bg-amber-400 text-black font-bold" : "text-slate-300 hover:text-white"
              }`}
            >
              <SunMoon className="w-4 h-4" />
            </button>
            <button
              onClick={toggleVoice}
              title="Toggle Voice Assistant Feedback"
              className={`p-1.5 rounded transition ${
                voiceEnabled ? "bg-care-teal text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Emergency Care Card Link */}
          <Link
            href="/emergency"
            className="flex items-center space-x-1.5 bg-red-600/90 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline">Emergency Card</span>
          </Link>

          {/* Notifications Link */}
          <Link
            href="/notifications"
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-care-amber rounded-full" />
          </Link>

          {/* Role Switcher (Hackathon Demonstration Tool) */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center space-x-2 bg-navy-800 hover:bg-navy-700 px-3 py-1.5 rounded-lg border border-navy-700 text-xs text-white transition"
            >
              <User className="w-3.5 h-3.5 text-care-teal" />
              <span className="font-medium hidden sm:inline">{user?.displayName || "User"}</span>
              <span className="text-[10px] bg-care-blue/30 text-care-blueLight px-1.5 py-0.5 rounded font-mono font-bold">
                {currentRole}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Demo Role Switcher
                  </p>
                  <p className="text-xs text-slate-300 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    switchRole("PRIMARY_CAREGIVER");
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                    currentRole === "PRIMARY_CAREGIVER" ? "text-care-teal font-bold bg-slate-800/50" : "text-slate-300"
                  }`}
                >
                  <span>David Vance (Caregiver)</span>
                  <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">Primary</span>
                </button>
                <button
                  onClick={() => {
                    switchRole("PATIENT");
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                    currentRole === "PATIENT" ? "text-care-teal font-bold bg-slate-800/50" : "text-slate-300"
                  }`}
                >
                  <span>Eleanor Vance (Patient)</span>
                  <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">Senior</span>
                </button>
                <button
                  onClick={() => {
                    switchRole("FAMILY_MEMBER");
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                    currentRole === "FAMILY_MEMBER" ? "text-care-teal font-bold bg-slate-800/50" : "text-slate-300"
                  }`}
                >
                  <span>Sarah Vance (Family)</span>
                  <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">Daughter</span>
                </button>
                <div className="border-t border-slate-800 mt-1 pt-1">
                  <Link
                    href="/settings"
                    onClick={() => setRoleDropdownOpen(false)}
                    className="block px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Profile & Settings
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
