import { Calendar, CheckCircle2, Clock, Download, FileCode2, Info, MessageSquare, Sparkles, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import { FormattedDate } from "@/components/FormattedDate";
import { getAssignmentStatus } from "../../_components/utils";

interface AssignmentCardProps {
  assign: any;
  onOpenSubmitDialog: (assign: any) => void;
  index: number;
}

export function AssignmentCard({ assign, onOpenSubmitDialog, index }: AssignmentCardProps) {
  const statusInfo = getAssignmentStatus(assign);
  const StatusIcon = statusInfo.icon;
  const submission = assign.submissions?.[0];
  const isGraded = submission?.status === "graded" || submission?.grade != null;
  const isReturned = submission?.status === "returned";
  const isPastDeadline = new Date(assign.deadline).getTime() < Date.now();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--cj-blue)] hover:shadow-xl"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--cj-blue)]">
                {assign.type?.toUpperCase() || "TP"}
              </span>
              {assign.difficulty && (
                <span className="inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 capitalize">
                  Niveau {assign.difficulty}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[var(--cj-blue)] transition-colors">
              {assign.title}
            </h3>
            <p className="text-xs font-medium text-slate-500">
              {assign.formation?.title || "Formation"} 
              {assign.session && (
                <span> • Session du <FormattedDate date={assign.session.startDate} /></span>
              )}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full border shrink-0 ${statusInfo.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusInfo.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed font-opensans">
          {assign.description}
        </p>

        {/* Teacher Instructions */}
        {assign.instructions && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
              <Info className="h-4 w-4 text-amber-600" />
              Consignes :
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed font-opensans">
              {assign.instructions}
            </p>
          </div>
        )}

        {/* Attachments from Admin */}
        {assign.files && assign.files.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Supports joints ({assign.files.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {assign.files.map((file: any) => {
                const fileUrl = file.url || file.fileUrl || "#";
                const fileName = file.originalName || file.name || file.fileName || "Document";
                return (
                  <a
                    key={file.id || fileName}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-1.5 text-[11px] font-bold text-[var(--cj-blue)] hover:bg-blue-100 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]">{fileName}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Grading / Feedback */}
        {(isGraded || isReturned) && submission && (
          <div className={`rounded-2xl border p-4 space-y-2 text-xs ${isReturned ? "border-amber-300 bg-amber-50" : "border-emerald-300 bg-emerald-50"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Sparkles className={`h-4 w-4 ${isReturned ? 'text-amber-600' : 'text-emerald-600'}`} />
                <span>{isReturned ? "Révision demandée :" : "Évaluation :"}</span>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-xl text-white ${isReturned ? "bg-amber-600" : "bg-emerald-600"}`}>
                {submission.grade != null ? `${submission.grade} / 20` : "-- / 20"}
              </span>
            </div>

            {submission.feedback && (
              <div className="pt-2 border-t border-slate-200/50 space-y-1">
                <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                  Retour :
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed font-opensans pl-4 border-l-2 border-slate-300 italic">
                  "{submission.feedback}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Student's submitted files */}
        {submission?.files && submission.files.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FileCode2 className="h-3 w-3 text-slate-400" />
                Votre dépôt
              </p>
              {submission.submittedAt && (
                <span className="text-[10px] text-slate-400 font-medium">
                  Le <FormattedDate date={submission.submittedAt} />
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {submission.files.map((file: any) => {
                const fileUrl = file.url || file.fileUrl || "#";
                const fileName = file.originalName || file.name || file.fileName || "Rendu";
                return (
                  <a
                    key={file.id || fileName}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span className="truncate max-w-[170px]">{fileName}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-600">
          <Calendar className={`h-4 w-4 ${isPastDeadline ? 'text-red-500' : 'text-slate-400'}`} />
          <span className={isPastDeadline ? 'text-red-600 font-bold' : ''}>
            Limite : <FormattedDate date={assign.deadline} />
          </span>
        </div>

        {(!submission || (assign.allowResubmission !== false && !isGraded) || isReturned) && (
          <button
            onClick={() => onOpenSubmitDialog(assign)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm active:scale-95 ${
              submission
                ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                : "bg-[var(--cj-blue)] hover:bg-blue-800 text-white"
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>{submission ? "Modifier mon dépôt" : "Déposer mon travail"}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
