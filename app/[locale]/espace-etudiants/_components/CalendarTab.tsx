"use client";

import { StudentEmptyState as EmptyState } from "@/components/ui/student-space";
import { formatDate } from "./utils";

interface CalendarTabProps {
  calendarTimeline: any[];
}

export function CalendarTab({ calendarTimeline }: CalendarTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">
          Calendrier des échéances
        </h3>
        <p className="text-xs text-slate-500">
          Planifiez vos travaux et consultez les dates clés de vos sessions.
        </p>
      </div>

      {calendarTimeline.length > 0 ? (
        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8 py-4">
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
            title="Calendrier vide"
            description="Aucune échéance académique enregistrée."
          />
        </div>
      )}
    </div>
  );
}
