"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/lib/db/service";
import { PatientMembership, Invitation, ActivityLog } from "@/types";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  Mail,
  Copy,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";

export default function FamilyManagementPage() {
  const { patient, user, currentRole } = useAuth();
  const [memberships, setMemberships] = useState<PatientMembership[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRelationship, setInviteRelationship] = useState("");
  const [inviteRole, setInviteRole] = useState<"PRIMARY_CAREGIVER" | "FAMILY_MEMBER">("FAMILY_MEMBER");
  const [generatedInvite, setGeneratedInvite] = useState<Invitation | null>(null);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    if (!patient) return;
    const [mems, logs] = await Promise.all([
      dbService.getPatientMemberships(patient.id),
      dbService.getActivityLogs(patient.id),
    ]);
    setMemberships(mems.sort((a, b) => a.escalationPriority - b.escalationPriority));
    setActivityLogs(logs);
  };

  useEffect(() => {
    loadData();
  }, [patient]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !user) return;

    const token = `inv_${Math.random().toString(36).slice(2, 12)}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48-hour single-use expiry

    const invite = await dbService.createInvitation({
      patientId: patient.id,
      patientName: patient.fullName,
      inviterUserId: user.id,
      inviterName: user.displayName,
      inviteeEmail: inviteEmail,
      role: inviteRole,
      relationship: inviteRelationship,
      token,
      expiresAt,
    });

    setGeneratedInvite(invite);
  };

  const handleCopyLink = () => {
    if (!generatedInvite) return;
    const inviteUrl = `${window.location.origin}/login?invite=${generatedInvite.token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center space-x-2.5">
            <Users className="w-7 h-7 text-purple-600" />
            <span>Family Care Team & Escalation Protocol</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Authorized caregivers, family contacts, and escalation order for {patient?.fullName}.
          </p>
        </div>

        {currentRole === "PRIMARY_CAREGIVER" && (
          <button
            onClick={() => {
              setGeneratedInvite(null);
              setInviteEmail("");
              setInviteRelationship("");
              setIsInviteModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Family Member</span>
          </button>
        )}
      </div>

      {/* Escalation Sequence Visualizer */}
      <div className="bg-gradient-to-r from-navy-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-care-teal">
            Fail-Safe Protocol
          </span>
          <h2 className="text-lg font-bold text-white mt-1">Multi-Tier Escalation Order</h2>
          <p className="text-xs text-slate-300">
            If a scheduled medication reminder is not self-reported as taken within the 15-minute grace period, CareLoop alerts contacts in this exact priority sequence:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {memberships
            .filter((m) => m.role !== "PATIENT")
            .map((mem, idx) => (
              <div
                key={mem.id}
                className="p-4 rounded-2xl bg-navy-800/80 border border-navy-700/80 space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-care-teal/20 text-care-teal px-2 py-0.5 rounded">
                    Tier {idx + 1} Alert
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">{mem.relationship}</span>
                </div>
                <h4 className="font-bold text-sm text-white">
                  {mem.userId === "user_caregiver_david"
                    ? "David Vance"
                    : mem.userId === "user_family_sarah"
                    ? "Sarah Vance"
                    : mem.userId === "user_family_michael"
                    ? "Michael Vance"
                    : mem.userId}
                </h4>
                <p className="text-[11px] text-slate-300">
                  {idx === 0
                    ? "Primary Caregiver (Instant Alert at +15 mins)"
                    : `Secondary Family (Escalated at +${15 + idx * 15} mins)`}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Family Members Table & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-base text-navy-900">Authorized Care Circle Members</h3>
          <div className="divide-y divide-slate-100">
            {memberships.map((mem) => (
              <div key={mem.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                    {mem.relationship.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {mem.userId === "user_caregiver_david"
                        ? "David Vance"
                        : mem.userId === "user_family_sarah"
                        ? "Sarah Vance"
                        : mem.userId === "user_family_michael"
                        ? "Michael Vance"
                        : mem.userId === "user_patient_eleanor"
                        ? "Eleanor Vance (Patient)"
                        : mem.userId}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Relationship: <strong>{mem.relationship}</strong> • Role: <strong>{mem.role}</strong>
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    mem.role === "PRIMARY_CAREGIVER"
                      ? "bg-blue-100 text-blue-800"
                      : mem.role === "PATIENT"
                      ? "bg-teal-100 text-teal-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {mem.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-base text-navy-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-care-teal" />
            <span>Care Activity Stream</span>
          </h3>
          <div className="space-y-3">
            {activityLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="text-xs space-y-0.5 border-l-2 border-care-blue pl-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{log.action.replace(/_/g, " ")}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invitation Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Invite Family Member</h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!generatedInvite ? (
              <form onSubmit={handleCreateInvite} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Family Member Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. sarah.vance@careloop.local"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Relationship to {patient?.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteRelationship}
                    onChange={(e) => setInviteRelationship(e.target.value)}
                    placeholder="e.g. Daughter, Grandson, Home Nurse"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Access Role *</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="FAMILY_MEMBER">Authorized Family Member (Tier 2/3 Escalations)</option>
                    <option value="PRIMARY_CAREGIVER">Co-Primary Caregiver (Full Admin Access)</option>
                  </select>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                  Generates an encrypted, single-use invitation token valid for 48 hours.
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow"
                  >
                    Generate Secure Link
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Single-Use Invitation Generated!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Share this link with {generatedInvite.inviteeEmail}. Expires in 48 hours.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 font-mono text-[11px] break-all border border-slate-200 select-all">
                  {typeof window !== "undefined" && `${window.location.origin}/login?invite=${generatedInvite.token}`}
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold flex items-center space-x-1.5 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? "Copied Link!" : "Copy Invitation Link"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setGeneratedInvite(null);
                    }}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
