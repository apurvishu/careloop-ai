import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";
import VoiceFloatingWidget from "@/components/common/VoiceFloatingWidget";

export const metadata: Metadata = {
  title: "CareLoop AI — Intelligent Elderly Care & Safety Ecosystem",
  description:
    "Smart healthcare coordination platform that helps elderly people manage medications and appointments while keeping caregivers informed through proactive escalations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <AuthProvider>
          <AccessibilityProvider>
            <Navbar />
            <div className="flex-1 flex w-full">
              <Sidebar />
              <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {children}
              </main>
            </div>
            <VoiceFloatingWidget />
          </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
