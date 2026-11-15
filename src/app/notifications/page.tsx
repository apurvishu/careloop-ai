"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/lib/db/service";
import { NotificationItem } from "@/types";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Calendar,
  Users,
  Clock,
  CheckCheck,
} from "lucide-react";

export default function NotificationCenterPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const data = await dbService.getNotifications(user.id);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkRead = async (id: string) => {
    await dbService.markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await dbService.markAllNotificationsAsRead(user.id);
    loadNotifications();
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "MEDICATION_DUE":
      case "MEDICATION_MISSED":
        return <Pill className="w-5 h-5 text-care-teal" />;
      case "CAREGIVER_ALERT":
      case "ALERT_ESCALATION":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "APPOINTMENT_REMINDER":
        return <Calendar className="w-5 h-5 text-care-blue" />;
      case "FAMILY_INVITE":
        return <Users className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center space-x-2.5">
            <Bell className="w-7 h-7 text-care-amber" />
            <span>Notification & Alert Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time delivery status for medication reminders, escalation dispatches, and care alerts.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            You have no notifications at this time.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex items-start justify-between gap-4 transition ${
                !notif.read ? "bg-blue-50/40" : "hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-900">{notif.title}</h3>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-care-blue" />
                    )}
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                      {notif.deliveryStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(notif.createdAt).toLocaleDateString()}{" "}
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="p-1 text-xs text-slate-400 hover:text-care-blue flex-shrink-0"
                  title="Mark as read"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
