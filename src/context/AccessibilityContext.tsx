"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AccessibilitySettings } from "@/types";

interface AccessibilityContextType extends AccessibilitySettings {
  language: "en" | "hi" | "kn";
  toggleLargeText: () => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleVoice: () => void;
  setLanguage: (lang: "en" | "hi" | "kn") => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [language, setLanguageState] = useState<"en" | "hi" | "kn">("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("careloop_a11y");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.largeText !== undefined) setLargeText(parsed.largeText);
        if (parsed.highContrast !== undefined) setHighContrast(parsed.highContrast);
        if (parsed.reducedMotion !== undefined) setReducedMotion(parsed.reducedMotion);
        if (parsed.voiceEnabled !== undefined) setVoiceEnabled(parsed.voiceEnabled);
        if (parsed.language) setLanguageState(parsed.language);
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  const saveToStorage = (updates: Partial<AccessibilitySettings & { language: string }>) => {
    try {
      const current = {
        largeText,
        highContrast,
        reducedMotion,
        voiceEnabled,
        screenReaderOptimized: true,
        language,
        ...updates,
      };
      localStorage.setItem("careloop_a11y", JSON.stringify(current));
    } catch {
      // Fallback
    }
  };

  const toggleLargeText = () => {
    setLargeText((prev) => {
      saveToStorage({ largeText: !prev });
      return !prev;
    });
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      saveToStorage({ highContrast: !prev });
      return !prev;
    });
  };

  const toggleReducedMotion = () => {
    setReducedMotion((prev) => {
      saveToStorage({ reducedMotion: !prev });
      return !prev;
    });
  };

  const toggleVoice = () => {
    setVoiceEnabled((prev) => {
      saveToStorage({ voiceEnabled: !prev });
      return !prev;
    });
  };

  const setLanguage = (lang: "en" | "hi" | "kn") => {
    setLanguageState(lang);
    saveToStorage({ language: lang });
  };

  return (
    <AccessibilityContext.Provider
      value={{
        largeText,
        highContrast,
        reducedMotion,
        voiceEnabled,
        screenReaderOptimized: true,
        language,
        toggleLargeText,
        toggleHighContrast,
        toggleReducedMotion,
        toggleVoice,
        setLanguage,
      }}
    >
      <div
        className={`min-h-screen ${
          highContrast ? "high-contrast bg-black text-white" : "bg-slate-50 text-slate-900"
        } ${largeText ? "text-lg" : "text-base"} ${
          reducedMotion ? "motion-reduce" : ""
        }`}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
