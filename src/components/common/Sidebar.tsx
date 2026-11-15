"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Pill,
  History,
  Calendar,
  Users,
  LineChart,
  Sparkles,
  ShieldAlert,
  Bell,
  Eye,
  Settings,
  HelpCircle,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { currentRole } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Medications", href: "/medications", icon: Pill },
    { name: "Medication History", href: "/medications/history", icon: History },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Family & Caregivers", href: "/family", icon: Users },
    { name: "Adherence Analytics", href: "/analytics", icon: LineChart },
    { name: "AI Care Insights", href: "/ai-insights", icon: Sparkles, badge: "Gemini" },
    { name: "Emergency Care Card", href: "/emergency", icon: ShieldAlert, alert: true },
    { name: "Notification Center", href: "/notifications", icon: Bell },
    { name: "Accessibility Mode", href: "/accessibility", icon: Eye },
    { name: "Profile & Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-950 text-slate-300 flex flex-col min-h-[calc(100vh-4rem)] border-r border-navy-800 hidden md:flex">
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Ecosystem Navigation
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-care-blue text-white shadow-md shadow-blue-900/30"
                  : item.alert
                  ? "text-red-300 hover:bg-red-950/40 hover:text-red-200"
                  : "text-slate-300 hover:bg-navy-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-white"
                      : item.alert
                      ? "text-red-400"
                      : item.badge
                      ? "text-care-teal"
                      : "text-slate-400"
                  }`}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] bg-care-teal/20 text-care-teal border border-care-teal/30 px-1.5 py-0.5 rounded font-mono font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Role scope footer */}
      <div className="p-4 border-t border-navy-800/80 bg-navy-900/50">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
          <HelpCircle className="w-3.5 h-3.5 text-care-teal" />
          <span>Active Role: <strong className="text-white">{currentRole}</strong></span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Role-based permissions filter views and actions across the dashboard.
        </p>
      </div>
    </aside>
  );
}
