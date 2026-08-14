"use client";

import { useState } from "react";
import {
  ArrowRight, Clock, FileText, Award, MessageSquare,
  CheckCircle2, AlertTriangle, Eye, Download, ChevronDown, ChevronUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getAssignmentStatus } from "./utils";
import { canStudentSubmitAssignment } from "@/lib/submission-rules";

interface AssignmentsTabProps {
  assignments: any[];
  setSelectedAssignmentForSubmission: (assignment: any) => void;
}

// ─── Correction status config ───────────────────────────────────────────────
const CORRECTION_STATUS: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: "En attente de correction", color: "bg-amber-50 text-amber-700 border-amber-200",       icon: Clock         },
  in_review: { label: "En cours de correction",   color: "bg-blue-50 text-blue-700 border-blue-200",          icon: Eye           },
  graded:    { label: "Corrigé",                  color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2  },
  returned:  { label: "À reprendre",              color: "bg-orange-50 text-orange-700 border-orange-200",    icon: AlertTriangle },
  validated: { label: "Validé",                   color: "bg-purple-50 text-purple-700 border-purple-200",    icon: Award         },
}

function CorrectionBadge({ status }: { status: string }) {
  const cfg = CORRECTION_STATUS[status] || CORRECTION_STATUS.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${cfg.color}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

// ─── Grade display — responsive mobile ──────────────────────────────────────
function GradeDisplay({ grade, maxGrade, percentage }: { grade: number; maxGrade: number; percentage: number | null }) {
  const pct = percentage ?? Math.round((grade / maxGrade) * 100);
  const color = pct >= 60 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-red-600";
  const bg    = pct >= 60 ? "bg-emerald-50 border-emerald-200" : pct >= 40 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  return (
    <div className={`rounded-2xl border ${bg} px-4 py-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4`}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-0.5">Note obtenue</p>
        <p className="text-2xl font-black text-slate-900">
          {grade}<span className="text-sm font-normal text-slate-400">/{maxGrade}</span>
        </p>
      </div>
      <div className="sm:text-right">
        <p className={`text-2xl font-black sm:text-3xl ${color}`}>{pct}%</p>
        <p className="text-[10px] text-slate-400 font-semibold">Pourcentage</p>
      </div>
    </div>
  );
}

// ─── Submission result card ─────────────────────────────────────────────────
function SubmissionResult({ submission }: { submission: any }) {
  const [expanded, setExpanded] = useState(false);
  const cs = submission.correctionStatus || "pending";
  const hasGrade = submission.grade !== null && submission.grade !== undefined;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <CorrectionBadge status={cs} />
          <span className="text-[11px] text-slate-400">
            Remis le {new Date(submission.submittedAt).toLocaleDateString("fr-FR")}
          </span>
        </div>
        <button onClick={() => setExpanded(v => !v)}
          className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Grade — always visible if graded */}
      {hasGrade && (
        <div className="px-4 pt-3">
          <GradeDisplay
            grade={submission.grade}
            maxGrade={submission.maxGrade ?? 100}
            percentage={submission.percentage ?? null}
          />
        </div>
      )}

      {/* Feedback — always visible if present */}
      {submission.feedback && (
        <div className="mx-4 mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600 mb-1 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> Commentaire du correcteur
          </p>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{submission.feedback}</p>
        </div>
      )}

      {/* Expandable: submitted files */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 space-y-3">
          {submission.SubmissionFile?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">
                Fichiers remis ({submission.SubmissionFile.length})
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {submission.SubmissionFile.map((f: any) => (
                  <a key={f.id} href={f.url} target="_blank" rel="noreferrer" download
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[var(--cj-blue)] hover:border-blue-200 transition">
                    <Download className="h-3.5 w-3.5 shrink-0 text-[var(--cj-blue)]" />
                    <span className="truncate">{f.originalName || f.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          {submission.gradedBy && (
            <p className="text-[10px] text-slate-400">
              Corrigé par {submission.gradedBy}
              {submission.gradedAt ? ` — ${new Date(submission.gradedAt).toLocaleDateString("fr-FR")}` : ""}
            </p>
          )}
        </div>
      )}

      {/* Bottom padding when no expand */}
      {!expanded && (hasGrade || submission.feedback) && <div className="pb-3" />}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export function AssignmentsTab({ assignments, setSelectedAssignmentForSubmission }: AssignmentsTabProps) {
  const t = useTranslations("student.assignments");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">{t("title")}</h3>
        <p className="text-xs text-slate-500">{t("subtitle")}</p>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-3 sm:p-12">
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto border border-slate-200">
            <FileText className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-800 text-sm">{t("no_assignments")}</p>
          <p className="text-xs text-slate-500">Vos prochains travaux apparaîtront automatiquement dès leur publication.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {assignments.map((assign: any) => {
            const statusInfo  = getAssignmentStatus(assign);
            const StatusIcon  = statusInfo.icon;
            const submission  = assign.submissions?.[0] || assign.Submission?.[0];
            const hasResult   = submission && (submission.grade !== null || submission.feedback || submission.correctionStatus !== "pending");
            const canSubmit   = canStudentSubmitAssignment(assign);

            return (
              <div key={assign.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">

                {/* Card header */}
                <div className="p-4 space-y-3 flex-1 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--cj-blue)] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {assign.type?.toUpperCase() || "TP"}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{assign.title}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold">{assign.formation?.title || assign.Formation?.title || "Formation"}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                    </span>
                  </div>

                  {assign.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{assign.description}</p>
                  )}

                  {/* Deadline + note max */}
                  <div className="flex flex-wrap gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-500 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Limite : {new Date(assign.deadline).toLocaleDateString("fr-FR")}
                    </span>
                    {(assign.maxGrade ?? 100) !== 100 && (
                      <span className="flex items-center gap-1 text-[var(--cj-blue)] font-bold">
                        <Award className="w-3.5 h-3.5" />
                        Sur {assign.maxGrade} pts
                      </span>
                    )}
                  </div>

                  {/* Consignes */}
                  {assign.AssignmentFile?.length > 0 && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 space-y-2">
                      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[var(--cj-blue)]" />
                        Consignes / Documents joints
                      </p>
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {assign.AssignmentFile.map((file: any) => (
                          <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:text-[var(--cj-blue)] hover:border-blue-300 transition">
                            <ArrowRight className="w-3 h-3 shrink-0 text-[var(--cj-blue)]" />
                            <span className="truncate" title={file.originalName || file.name}>{file.originalName || file.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Result section */}
                {hasResult && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                    <SubmissionResult submission={submission} />
                  </div>
                )}

                {/* Action button */}
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 flex items-center justify-between sm:px-5 sm:pb-5">
                  <span className="text-[11px] text-slate-400">
                    {submission ? `Remis le ${new Date(submission.submittedAt).toLocaleDateString("fr-FR")}` : "Non remis"}
                  </span>
                  {canSubmit && (
                    <button onClick={() => setSelectedAssignmentForSubmission(assign)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--cj-blue)] px-3 py-2 text-xs font-bold text-white hover:bg-blue-900 transition">
                      {submission ? "Voir / Remettre" : "Déposer mon travail"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
