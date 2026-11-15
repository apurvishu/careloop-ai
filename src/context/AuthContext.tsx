"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, PatientProfile, UserRole } from "@/types";
import { mockStore } from "@/lib/db/mock-store";
import { DEMO_PATIENT_ID, DEMO_CAREGIVER_ID } from "@/lib/constants";

interface AuthContextType {
  user: UserProfile | null;
  patient: PatientProfile | null;
  currentRole: UserRole;
  isLoading: boolean;
  loginAs: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>("PRIMARY_CAREGIVER");
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = (userId: string) => {
    const userDoc = mockStore.getDocument("users", userId);
    const patientDoc = mockStore.getDocument("patients", DEMO_PATIENT_ID);

    if (userDoc) {
      setUser(userDoc);
      setCurrentRole(userDoc.role);
    }
    if (patientDoc) {
      setPatient(patientDoc);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Default to David Vance (Primary Caregiver) for richest feature demonstration
    loadUserData(DEMO_CAREGIVER_ID);
  }, []);

  const loginAs = (userId: string) => {
    setIsLoading(true);
    loadUserData(userId);
  };

  const switchRole = (role: UserRole) => {
    if (role === "PATIENT") {
      loginAs("user_patient_eleanor");
    } else if (role === "PRIMARY_CAREGIVER") {
      loginAs(DEMO_CAREGIVER_ID);
    } else if (role === "FAMILY_MEMBER") {
      loginAs("user_family_sarah");
    }
  };

  const logout = () => {
    setUser(null);
  };

  const refreshData = () => {
    if (user) {
      loadUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patient,
        currentRole,
        isLoading,
        loginAs,
        switchRole,
        logout,
        refreshData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
