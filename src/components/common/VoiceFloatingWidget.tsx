"use client";

import React, { useState } from "react";
import { Mic, MicOff, Volume2, X } from "lucide-react";
import { voiceAssistant, VoiceCommandMatch } from "@/lib/speech/voice-service";
import { useAuth } from "@/context/AuthContext";
import { mockStore } from "@/lib/db/mock-store";
import { dbService } from "@/lib/db/service";
import { useRouter } from "next/navigation";

export default function VoiceFloatingWidget() {
  const router = useRouter();
  const { patient, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [assistantResponse, setAssistantResponse] = useState<string | null>(null);

  const handleStartListening = () => {
    setIsListening(true);
    setTranscript("Listening... Please speak your care command.");
    setAssistantResponse(null);

    voiceAssistant.startListening(
      async (match: VoiceCommandMatch) => {
        setIsListening(false);
        setTranscript(`"${match.rawText}"`);
        await handleVoiceCommand(match);
      },
      (error: string) => {
        setIsListening(false);
        setTranscript(`Microphone error: ${error}`);
      }
    );
  };

  const handleStopListening = () => {
    voiceAssistant.stopListening();
    setIsListening(false);
  };

  const handleVoiceCommand = async (match: VoiceCommandMatch) => {
    if (!patient) return;

    if (match.action === "MEDICATION_NOW") {
      const doses = await dbService.getDoses(patient.id);
      const pendingDose = doses.find((d) => d.status === "PENDING" || d.status === "SNOOZED");
      if (pendingDose) {
        const text = `Your next scheduled medicine is ${pendingDose.medicationName}, ${pendingDose.dosage}, scheduled for ${new Date(pendingDose.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`;
        setAssistantResponse(text);
        voiceAssistant.speak(text);
      } else {
        const text = "All your medications for today are taken. You are all caught up!";
        setAssistantResponse(text);
        voiceAssistant.speak(text);
      }
    } else if (match.action === "NEXT_APPOINTMENT") {
      const appointments = await dbService.getAppointments(patient.id);
      const nextApt = appointments.find((a) => a.status === "SCHEDULED");
      if (nextApt) {
        const text = `Your next appointment is with ${nextApt.doctorName} at ${nextApt.hospitalOrClinic} on ${nextApt.appointmentDate} at ${nextApt.appointmentTime}.`;
        setAssistantResponse(text);
        voiceAssistant.speak(text);
      } else {
        const text = "You have no upcoming doctor appointments scheduled.";
        setAssistantResponse(text);
        voiceAssistant.speak(text);
      }
    } else if (match.action === "MEDICATION_HISTORY") {
      const text = "Opening your medication history log now.";
      setAssistantResponse(text);
      voiceAssistant.speak(text, () => {
        router.push("/medications/history");
        setIsOpen(false);
      });
    } else if (match.action === "REMIND_LATER") {
      const doses = await dbService.getDoses(patient.id);
      const pendingDose = doses.find((d) => d.status === "PENDING");
      if (pendingDose) {
        await dbService.snoozeDose(pendingDose.id, user?.id || "patient", 15);
        const text = `I have snoozed ${pendingDose.medicationName} for 15 minutes. We will remind you again shortly.`;
        setAssistantResponse(text);
        voiceAssistant.speak(text);
      } else {
        const text = "No active medication reminder needs snoozing right now.";
        setAssistantResponse(text);
        voiceAssistant.speak(text);
      }
    } else if (match.action === "CARE_ASSISTANCE") {
      // Create emergency/assistance notification
      const text = "Caregiver assistance request initiated. We have alerted your primary caregiver David immediately.";
      await dbService.logActivity(
        patient.id,
        user?.id || "patient",
        patient.fullName,
        "VOICE_ASSISTANCE_REQUEST",
        "Patient triggered voice assistance request: Needs caregiver check-in.",
        "ALERT"
      );
      setAssistantResponse(text);
      voiceAssistant.speak(text);
    } else {
      const text = "I heard you, but I did not recognize that specific healthcare command. You can ask: What medicine should I take now, or when is my next appointment.";
      setAssistantResponse(text);
      voiceAssistant.speak(text);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50 no-print">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Elderly Voice Assistant"
          className="h-16 w-16 rounded-full bg-gradient-to-r from-care-teal to-care-blue text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all focus:ring-4 focus:ring-care-blue/50"
        >
          <Mic className="h-8 w-8 text-white" />
        </button>
      </div>

      {/* Voice Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-slate-900 border-2 border-care-teal text-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => {
                handleStopListening();
                voiceAssistant.stopSpeaking();
                setIsOpen(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-care-teal/20 text-care-teal border border-care-teal/30">
                <Volume2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">Elderly Voice Assistant</h2>
              <p className="text-sm text-slate-300">
                Speak directly or tap a quick question below:
              </p>

              {/* Status & Transcript Area */}
              <div className="min-h-[90px] p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center">
                {transcript ? (
                  <p className="text-lg font-medium text-care-tealLight">{transcript}</p>
                ) : (
                  <p className="text-sm text-slate-400">
                    Tap the microphone button to start speaking
                  </p>
                )}
                {assistantResponse && (
                  <p className="mt-2 text-base font-semibold text-emerald-300 border-t border-slate-700/60 pt-2">
                    {assistantResponse}
                  </p>
                )}
              </div>

              {/* Big Voice Control Button */}
              <div className="pt-2">
                {isListening ? (
                  <button
                    onClick={handleStopListening}
                    className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg flex items-center justify-center space-x-3 shadow-lg animate-pulse"
                  >
                    <MicOff className="w-6 h-6" />
                    <span>Stop Listening</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartListening}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-care-teal to-care-blue hover:from-teal-600 hover:to-blue-600 text-white font-bold text-lg flex items-center justify-center space-x-3 shadow-lg"
                  >
                    <Mic className="w-6 h-6" />
                    <span>Start Voice Command</span>
                  </button>
                )}
              </div>

              {/* Quick Sample Questions */}
              <div className="pt-2 text-left">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Example Commands
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleVoiceCommand({ action: "MEDICATION_NOW", rawText: "What medicine should I take now?" })}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-left border border-slate-700"
                  >
                    "What medicine should I take now?"
                  </button>
                  <button
                    onClick={() => handleVoiceCommand({ action: "NEXT_APPOINTMENT", rawText: "When is my next appointment?" })}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-left border border-slate-700"
                  >
                    "When is my next appointment?"
                  </button>
                  <button
                    onClick={() => handleVoiceCommand({ action: "REMIND_LATER", rawText: "Remind me in 15 minutes" })}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-left border border-slate-700"
                  >
                    "Remind me in 15 minutes"
                  </button>
                  <button
                    onClick={() => handleVoiceCommand({ action: "CARE_ASSISTANCE", rawText: "I need caregiver assistance" })}
                    className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-200 text-left border border-red-800/50"
                  >
                    "I need caregiver assistance"
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
