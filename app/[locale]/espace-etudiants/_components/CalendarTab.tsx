"use client";

import { StudentEmptyState as EmptyState } from "@/components/ui/student-space";
import { formatDate } from "./utils";
import { publicMessages } from "@/lib/i18n/public-messages";

interface CalendarTabProps {
  calendarTimeline: any[];
  locale: string;
}

export function CalendarTab({ calendarTimeline, locale }: CalendarTabProps) {
  const t = (publicMessages.espaceEtudiants[locale as "fr" | "en"] ?? publicMessages.espaceEtudiants.fr).calendar;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">
          {t.title}
        </h3>
        <p className="text-xs text-slate-500">
          {t.desc}
        </p>
      </div>

      {calendarTimeline.length > 0 ? (
        <div className="relative ml-4 overflow-x-hidden border-l-2 border-slate-200 pl-5 space-y-6 py-2 sm:ml-4 sm:pl-6 sm:space-y-8 sm:py-4">
          {calendarTimeline.map((evt) => {
            const EvtIcon = evt.icon;
            return (
              <div key={evt.id} className="relative group">
                {/* Timeline point */}
                <div
                  className={`absolute -left-[37px] top-1 flex h-8 w-8 items-center justify-center rounded-full ${evt.color} text-white shadow ring-4 ring-white`}
                >
                  <EvtIcon className="h-4 w-4" />
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {evt.category}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {formatDate(evt.date)}
                    </span>
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-slate-900 leading-snug">
                    {evt.title}
                  </h4>

                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <EmptyState
            title={t.emptyTitle}
            description={t.emptyDesc}
          />
        </div>
      )}
    </div>
  );
}
