"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/lib/db/service";
import { Medication } from "@/types";
import {
  Pill,
  PlusCircle,
  Clock,
  Calendar,
  User,
  Edit,
  Archive,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

export default function MedicationsPage() {
  const { patient, currentRole } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDosage, setFormDosage] = useState("");
  const [formFrequency, setFormFrequency] = useState<Medication["frequency"]>("ONCE_DAILY");
  const [formTimes, setFormTimes] = useState("09:00");
  const [formDays, setFormDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [formEndDate, setFormEndDate] = useState("");
  const [formDoctor, setFormDoctor] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const loadMeds = async () => {
    if (!patient) return;
    setLoading(true);
    const data = await dbService.getMedications(patient.id);
    setMedications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMeds();
  }, [patient]);

  const resetForm = () => {
    setFormName("");
    setFormDosage("");
    setFormFrequency("ONCE_DAILY");
    setFormTimes("09:00");
    setFormDays([0, 1, 2, 3, 4, 5, 6]);
    setFormStartDate(new Date().toISOString().slice(0, 10));
    setFormEndDate("");
    setFormDoctor("");
    setFormInstructions("");
    setFormNotes("");
    setEditingMed(null);
  };

  const openEditModal = (med: Medication) => {
    setEditingMed(med);
    setFormName(med.name);
    setFormDosage(med.dosage);
    setFormFrequency(med.frequency);
    setFormTimes(med.scheduledTimes.join(", "));
    setFormDays(med.selectedDays);
    setFormStartDate(med.startDate);
    setFormEndDate(med.endDate || "");
    setFormDoctor(med.prescribingDoctor || "");
    setFormInstructions(med.instructions || "");
    setFormNotes(med.notes || "");
    setIsAddModalOpen(true);
  };

  const handleSaveMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    const timesArray = formTimes
      .split(",")
      .map((t) => t.trim())
      .filter((t) => /^[0-2]\d:[0-5]\d$/.test(t));

    const payload = {
      name: formName,
      dosage: formDosage,
      frequency: formFrequency,
      scheduledTimes: timesArray.length > 0 ? timesArray : ["09:00"],
      selectedDays: formDays,
      startDate: formStartDate,
      endDate: formEndDate || undefined,
      prescribingDoctor: formDoctor || undefined,
      instructions: formInstructions || undefined,
      notes: formNotes || undefined,
      isActive: true,
    };

    if (editingMed) {
      await dbService.updateMedication(editingMed.id, payload);
    } else {
      await dbService.createMedication(patient.id, payload);
    }

    setIsAddModalOpen(false);
    resetForm();
    loadMeds();
  };

  const handleArchive = async (id: string) => {
    await dbService.archiveMedication(id);
    loadMeds();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this medication record?")) {
      await dbService.deleteMedication(id);
      loadMeds();
    }
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Prescription Medications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Active medication schedules, dosage instructions, and recurrence rules for {patient?.fullName}.
          </p>
        </div>

        {currentRole === "PRIMARY_CAREGIVER" && (
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-care-teal hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Medication</span>
          </button>
        )}
      </div>

      {/* Clinical Safety Notice */}
      <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-center space-x-2.5">
        <AlertCircle className="w-4 h-4 text-care-blue flex-shrink-0" />
        <span>
          <strong>Clinical Safety Guardrail:</strong> CareLoop strictly records prescribed regimens. It never independently modifies dosages or recommends clinical alterations.
        </span>
      </div>

      {/* Medication List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medications.map((med) => (
          <div
            key={med.id}
            className={`rounded-3xl border p-6 flex flex-col justify-between transition-all ${
              med.isActive
                ? "bg-white border-slate-200/80 shadow-sm hover:shadow-md"
                : "bg-slate-50 border-slate-200 opacity-60"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-2xl bg-teal-50 flex items-center justify-center text-care-teal">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{med.name}</h3>
                    <p className="text-xs text-slate-500">{med.dosage}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    med.isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {med.isActive ? "ACTIVE" : "ARCHIVED"}
                </span>
              </div>

              {/* Schedule times & frequency */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-care-blue" />
                  <span>
                    Times: <strong>{med.scheduledTimes.join(", ")}</strong> ({med.frequency.replace(/_/g, " ")})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Days: {med.selectedDays.map((d) => dayLabels[d]).join(", ")}
                  </span>
                </div>
                {med.prescribingDoctor && (
                  <div className="flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Prescribed by: {med.prescribingDoctor}</span>
                  </div>
                )}
              </div>

              {med.instructions && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                  <strong>Instructions:</strong> {med.instructions}
                </div>
              )}
            </div>

            {/* Actions */}
            {currentRole === "PRIMARY_CAREGIVER" && (
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={() => openEditModal(med)}
                  title="Edit Medication"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-care-blue hover:bg-slate-100 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleArchive(med.id)}
                  title="Archive Medication"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition"
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(med.id)}
                  title="Delete Medication"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMed ? "Edit Medication Schedule" : "Add New Prescription"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedication} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Lisinopril, Metformin"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prescribed Dosage *</label>
                  <input
                    type="text"
                    required
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    placeholder="e.g. 10mg (1 tablet)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frequency *</label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="ONCE_DAILY">Once Daily</option>
                    <option value="TWICE_DAILY">Twice Daily</option>
                    <option value="THRICE_DAILY">Thrice Daily</option>
                    <option value="CUSTOM">Custom Schedule</option>
                    <option value="AS_NEEDED">As Needed (PRN)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Scheduled Times (24hr HH:mm, comma separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTimes}
                    onChange={(e) => setFormTimes(e.target.value)}
                    placeholder="e.g. 09:00, 20:30"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prescribing Doctor</label>
                <input
                  type="text"
                  value={formDoctor}
                  onChange={(e) => setFormDoctor(e.target.value)}
                  placeholder="e.g. Dr. Robert Chen (Cardiology)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-care-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructions for Senior</label>
                <textarea
                  rows={2}
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="e.g. Take with food and a full glass of water. Do not crush."
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
                  className="px-5 py-2 rounded-xl bg-care-teal hover:bg-teal-700 text-white font-bold transition shadow"
                >
                  {editingMed ? "Save Changes" : "Create Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
