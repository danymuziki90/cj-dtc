"use client";

import { StudentEmptyState as EmptyState } from "@/components/ui/student-space";
import { formatDateTime } from "./utils";

interface NotificationsTabProps {
  notifications: any[];
}

export function NotificationsTab({ notifications }: NotificationsTabProps) {
  const getNotificationColor = (type: string) => {
    if (type === "reminder") return "border-l-4 border-l-red-500 bg-red-50/30";
    if (type === "correction")
      return "border-l-4 border-l-emerald-500 bg-emerald-50/30";
    return "border-l-4 border-l-blue-500 bg-blue-50/30";
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">
          Centre de notifications
        </h3>
        <p className="text-xs text-slate-500">
          Consultez l'historique complet des alertes administratives et
          pédagogiques.
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((noti: any) => (
          <div
            key={noti.id}
            className={`rounded-2xl border border-slate-100 p-5 shadow-sm ${getNotificationColor(
              noti.type
            )}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900">
                  {noti.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {noti.message}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {formatDateTime(noti.createdAt)}
              </span>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-12 text-center">
            <EmptyState
              title="Aucune notification"
              description="Votre boîte de réception est vide."
            />
          </div>
        )}
      </div>
    </div>
  );
}
