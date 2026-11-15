"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/lib/db/service";
import { EmergencyProfile } from "@/types";
import {
  ShieldAlert,
  Phone,
  Printer,
  Heart,
  AlertCircle,
  Hospital,
  User,
  Pill,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function EmergencyCareCardPage() {
  const { patient } = useAuth();
  const [profile, setProfile] = useState<EmergencyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!patient) return;
      setLoading(true);
      const data = await dbService.getEmergencyProfile(patient.id);
      setProfile(data);
      setLoading(false);
    }
    loadProfile();
  }, [patient]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !profile) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        Loading Emergency Care Card...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Bar (Hidden on print) */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-xl bg-red-600 text-white flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
            Emergency Care Card
          </h1>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs flex items-center space-x-2 transition shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Physical / Digital Emergency Card Box */}
      <div className="bg-white rounded-3xl border-2 border-red-500 shadow-xl overflow-hidden print:border-black print:rounded-none">
        {/* Card Header Strip */}
        <div className="bg-red-600 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-100 bg-red-700/80 px-2.5 py-1 rounded-md">
              Medical Emergency Identification Card
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              {profile.patientName}
            </h2>
            <p className="text-xs sm:text-sm text-red-100 mt-1">
              DOB: <strong>{profile.dateOfBirth}</strong> • Blood Type:{" "}
              <strong className="text-white text-base bg-red-800 px-2 py-0.5 rounded ml-1">
                {profile.bloodType}
              </strong>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-red-100 block">Preferred Emergency Facility</span>
            <span className="text-sm sm:text-base font-bold text-white block mt-0.5">
              {profile.preferredHospital}
            </span>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Priority Emergency Contacts */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Phone className="w-4 h-4 text-red-600" />
              <span>Primary Emergency Contacts (Click to Call)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {profile.emergencyContacts.map((contact, idx) => (
                <a
                  key={idx}
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-2 hover:shadow-md ${
                    contact.isPrimary
                      ? "bg-red-50/70 border-red-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{contact.name}</span>
                      {contact.isPrimary && (
                        <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{contact.relationship}</p>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-bold text-red-700 pt-2 border-t border-slate-200/60">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{contact.phone}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Allergies & Critical Conditions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergies */}
            <div className="p-5 rounded-2xl bg-red-50/60 border border-red-200 space-y-2">
              <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Known Allergies & Drug Adverse Reactions</span>
              </h4>
              <ul className="space-y-1 text-xs font-semibold text-red-950">
                {profile.allergies.map((allergy, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                    <span>{allergy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Conditions */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                <Heart className="w-4 h-4 text-care-teal" />
                <span>Chronic / Medical Conditions</span>
              </h4>
              <ul className="space-y-1 text-xs text-slate-800">
                {profile.criticalConditions.map((cond, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Current Medications Summary */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Pill className="w-4 h-4 text-care-blue" />
              <span>Current Daily Medication Regimen</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {profile.currentMedicationsSummary.map((med, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 font-medium">
                  {med}
                </div>
              ))}
            </div>
          </div>

          {/* Attending Physician & Special Directives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                Attending Physician
              </span>
              <p className="font-bold text-slate-900 mt-0.5">{profile.doctorName}</p>
              <a href={`tel:${profile.doctorPhone}`} className="text-care-blue font-semibold hover:underline">
                {profile.doctorPhone}
              </a>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                Special Emergency Directives
              </span>
              <p className="text-slate-700 mt-0.5 leading-snug">{profile.specialInstructions}</p>
            </div>
          </div>

          {/* Timestamp & Legal Disclaimer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>Last Updated: {new Date(profile.lastUpdated).toLocaleDateString()}</span>
            <span className="text-center sm:text-right">
              CareLoop AI is not an emergency response service. In life-threatening emergencies, call 911 or 112 immediately.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
