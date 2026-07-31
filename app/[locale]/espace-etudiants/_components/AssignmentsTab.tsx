"use client";

import Link from "next/link";
import { ArrowRight, Clock, FileText } from "lucide-react";
import { getAssignmentStatus } from "./utils";

interface AssignmentsTabProps {
  assignments: any[];
  setSelectedAssignmentForSubmission: (assignment: any) => void;
}

export function AssignmentsTab({ assignments, setSelectedAssignmentForSubmission }: AssignmentsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Mes Travaux & Évaluations
          </h3>
          <p className="text-xs text-slate-500">
            Consultez vos TP, projets, examens et remettez vos devoirs en ligne.
          </p>
        </div>
        </div>

      {assignments.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto border border-slate-200">
            <FileText className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-800 text-sm">
            Aucun devoir à réaliser pour le moment
          </p>
          <p className="text-slate-500">
            Vos prochains travaux apparaîtront automatiquement dès leur publication.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assign: any) => {
            const statusInfo = getAssignmentStatus(assign);
            const StatusIcon = statusInfo.icon;
            const submission = assign.submissions?.[0];

            return (
              <div
                key={assign.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm hover:border-blue-200 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--cj-blue)] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {assign.type?.toUpperCase() || "TP"}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                      {assign.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {assign.formation?.title || "Formation"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.color}`}
                  >
                    <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {assign.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Limite :{" "}
                    {new Date(assign.deadline).toLocaleDateString("fr-FR")}
                  </span>

                  <button
                    onClick={() => setSelectedAssignmentForSubmission(assign)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--cj-blue)] hover:underline"
                  >
                    {submission ? "Voir mon rendu" : "Téléverser mon travail"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
