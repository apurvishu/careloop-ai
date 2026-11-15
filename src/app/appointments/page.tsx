"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/lib/db/service";
import { Appointment } from "@/types";
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  Edit,
  X,
  FileText,
} from "lucide-react";

export default function AppointmentManagerPage() {
  const { patient, currentRole } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);

  // Form State
  const [doctorName, setDoctorName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [hospitalOrClinic, setHospitalOrClinic] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [notes, setNotes] = useState("");
  const [remind24h, setRemind24h] = useState(true);
  const [remind2h, setRemind2h] = useState(true);

  const loadAppointments = async () => {
    if (!patient) return;
    setLoading(true);
    const data = await dbService.getAppointments(patient.id);
    setAppointments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();
  }, [patient]);

  const resetForm = () => {
    setDoctorName("");
    setSpecialty("");
    setHospitalOrClinic("");
    setAppointmentDate("");
    setAppointmentTime("10:00");
    setReasonForVisit("");
    setNotes("");
    setRemind24h(true);
    setRemind2h(true);
    setEditingApt(null);
  };

  const openEditModal = (apt: Appointment) => {
    setEditingApt(apt);
    setDoctorName(apt.doctorName);
    setSpecialty(apt.specialty || "");
    setHospitalOrClinic(apt.hospitalOrClinic);
    setAppointmentDate(apt.appointmentDate);
    setAppointmentTime(apt.appointmentTime);
    setReasonForVisit(apt.reasonForVisit);
    setNotes(apt.notes || "");
    setRemind24h(apt.reminderPreferences.remind24hBefore);
    setRemind2h(apt.reminderPreferences.remind2hBefore);
    setIsAddModalOpen(true);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    const payload = {
      doctorName,
      specialty: specialty || undefined,
      hospitalOrClinic,
      appointmentDate,
      appointmentTime,
      reasonForVisit,
      notes: notes || undefined,
      reminderPreferences: {
        remind24hBefore: remind24h,
        remind2hBefore: remind2h,
      },
      status: "SCHEDULED" as const,
    };

    if (editingApt) {
      await dbService.updateAppointment(editingApt.id, payload);
    } else {
      await dbService.createAppointment(patient.id, payload);
    }

    setIsAddModalOpen(false);
    resetForm();
    loadAppointments();
  };

  const handleMarkComplete = async (id: string) => {
    await dbService.updateAppointment(id, { status: "COMPLETED" });
    loadAppointments();
  };

  const handleCancelAppointment = async (id: string) => {
    if (confirm("Cancel this scheduled appointment?")) {
      await dbService.updateAppointment(id, { status: "CANCELLED" });
      loadAppointments();
    }
  };

  const upcomingApts = appointments.filter((a) => a.status === "SCHEDULED");
  const pastApts = appointments.filter((a) => a.status !== "SCHEDULED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center space-x-2.5">
            <CalendarIcon className="w-7 h-7 text-care-blue" />
            <span>Doctor Appointments</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Coordinate medical visits, specialist consultations, and healthcare reminders for {patient?.fullName}.
          </p>
        </div>

        {currentRole === "PRIMARY_CAREGIVER" && (
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-care-blue hover:bg-blue-600 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
        )}
      </div>

      {/* Upcoming Appointments Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-navy-900">Upcoming Medical Visits</h2>
        {upcomingApts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center text-slate-400 text-sm">
            No upcoming medical appointments scheduled.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingApts.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {apt.specialty || "General Visit"}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-1.5">{apt.doctorName}</h3>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                      {apt.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-care-blue" />
                      <span>
                        Date: <strong>{apt.appointmentDate}</strong> at <strong>{apt.appointmentTime}</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.hospitalOrClinic}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reason: &ldquo;{apt.reasonForVisit}&rdquo;</span>
                    </div>
                  </div>

                  {apt.notes && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                      <strong>Notes:</strong> {apt.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <span>Reminders: {apt.reminderPreferences.remind24hBefore ? "24h" : ""} {apt.reminderPreferences.remind2hBefore ? "• 2h" : ""}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMarkComplete(apt.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => openEditModal(apt)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-care-blue"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(apt.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments Section */}
      {pastApts.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-navy-900">Past & Completed Visits</h2>
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Doctor</th>
                    <th className="py-3 px-6">Clinic / Hospital</th>
                    <th className="py-3 px-6">Reason</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pastApts.map((apt) => (
                    <tr key={apt.id}>
                      <td className="py-3.5 px-6 font-medium text-slate-900">{apt.appointmentDate}</td>
                      <td className="py-3.5 px-6 font-bold">{apt.doctorName}</td>
                      <td className="py-3.5 px-6">{apt.hospitalOrClinic}</td>
                      <td className="py-3.5 px-6">{apt.reasonForVisit}</td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                            apt.status === "COMPLETED"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Schedule / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingApt ? "Edit Appointment" : "Schedule Medical Appointment"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Robert Chen"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Cardiology, Endocrinology"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hospital / Clinic *</label>
                <input
                  type="text"
                  required
                  value={hospitalOrClinic}
                  onChange={(e) => setHospitalOrClinic(e.target.value)}
                  placeholder="e.g. Mercy General Heart Center"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Visit *</label>
                <input
                  type="text"
                  required
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  placeholder="e.g. Routine 6-month blood pressure and ECG review"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Care Notes & Checklist</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Bring home blood pressure log, fasting blood test required..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-care-blue hover:bg-blue-600 text-white font-bold transition shadow"
                >
                  {editingApt ? "Save Changes" : "Confirm Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
