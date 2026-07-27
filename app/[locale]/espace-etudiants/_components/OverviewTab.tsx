"use client";

import Link from "next/link";
import { FormEvent } from "react";
import {
  ArrowRight,
  Bell,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Newspaper,
  Send,
  Upload,
} from "lucide-react";
import { formatDateShort, formatDateTime, getAssignmentStatus } from "./utils";

interface OverviewTabProps {
  currentSession: any;
  assignments: any[];
  news: any[];
  notifications: any[];
  setActiveTab: (tab: string) => void;
  setSelectedAssignmentForSubmission: (assignment: any) => void;
  setSelectedNewsForModal: (news: any) => void;
  sendQuestion: (e: FormEvent) => void;
  question: string;
  setQuestion: (val: string) => void;
  questionError: string;
  questionLoading: boolean;
  locale: string;
}

export function OverviewTab({
  currentSession,
  assignments,
  news,
  notifications,
  setActiveTab,
  setSelectedAssignmentForSubmission,
  setSelectedNewsForModal,
  sendQuestion,
  question,
  setQuestion,
  questionError,
  questionLoading,
  locale,
}: OverviewTabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Column - Formations & Deadlines previews */}
      <div className="lg:col-span-2 space-y-6">
        {/* Active Session Info */}
        {currentSession ? (
          <div className="rounded-2xl border border-white bg-white/60 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Session active
                </span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {currentSession.formationTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Format :{" "}
                  <span className="font-semibold text-slate-700">
                    {currentSession.format}
                  </span>{" "}
                  | Lieu :{" "}
                  <span className="font-semibold text-slate-700">
                    {currentSession.location}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setActiveTab("formations")}
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--cj-blue)] hover:underline"
              >
                Suivre le cours
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Travaux à venir — sync admin en temps réel */}
        <div className="rounded-2xl border border-white bg-white/60 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--cj-blue)]" />
              Mes travaux récents
            </h3>
            <Link
              href={`/${locale}/espace-etudiants/travaux`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--cj-blue)] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--cj-blue-700)] transition"
            >
              <Upload className="w-3.5 h-3.5" />
              Ouvrir Mes Travaux
            </Link>
          </div>

          {assignments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              Aucun devoir publié pour le moment. Les nouveaux travaux apparaîtront ici automatiquement.
            </p>
          ) : (
            <div className="space-y-3">
              {assignments.slice(0, 3).map((assign: any) => {
                const statusInfo = getAssignmentStatus(assign);
                const StatusIcon = statusInfo.icon;
                const submission = assign.submissions?.[0];
                const canSubmit =
                  !submission ||
                  (assign.allowResubmission !== false && submission.status !== "graded" && submission.grade == null) ||
                  submission.status === "returned";

                return (
                  <div
                    key={assign.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--cj-blue)]">
                          {assign.type?.toUpperCase() || "TP"}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{assign.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        Échéance : {formatDateShort(assign.deadline)}
                      </p>
                    </div>
                    {canSubmit ? (
                      <button
                        onClick={() => setSelectedAssignmentForSubmission(assign)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--cj-blue)] bg-blue-50 px-3 py-2 text-xs font-bold text-[var(--cj-blue)] hover:bg-blue-100 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {submission ? "Modifier" : "Déposer"}
                      </button>
                    ) : (
                      <Link
                        href={`/${locale}/espace-etudiants/travaux`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--cj-blue)] hover:underline"
                      >
                        Voir le détail
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mini News Feed */}
        <div className="rounded-2xl border border-white bg-white/60 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-indigo-600" />
              Dernières actualités
            </h3>
            <button
              onClick={() => setActiveTab("news")}
              className="text-xs font-bold text-[var(--cj-blue)] hover:underline"
            >
              Toutes les actualités ({news.length})
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {news.slice(0, 2).map((item: any) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:border-indigo-100 transition"
              >
                <div>
                  <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">
                    {item.category || "Annonce"} •{" "}
                    {formatDateShort(item.createdAt)}
                  </span>
                  <h4 className="mt-1 text-xs font-bold text-slate-900 line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedNewsForModal(item)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--cj-blue)] hover:underline"
                  >
                    Lire la suite
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {news.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4 col-span-2">
                Aucune actualité disponible.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Questions & Support widget + Mini Notifications Stream */}
      <div className="space-y-6">
        {/* Unified Notifications Feed */}
        <div className="rounded-2xl border border-white bg-white/60 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            Activités récentes
          </h3>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {notifications.slice(0, 5).map((noti: any) => (
              <div
                key={noti.id}
                className="flex gap-3 text-xs border-b border-slate-100 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950 leading-tight">
                    {noti.title}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    {noti.message}
                  </p>
                  <span className="text-[9px] text-slate-400 mt-1 block">
                    {formatDateTime(noti.createdAt)}
                  </span>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">
                Pas d'activité récente.
              </p>
            )}
          </div>
          <button
            onClick={() => setActiveTab("notifications")}
            className="w-full text-center text-xs font-bold text-[var(--cj-blue)] mt-4 hover:underline"
          >
            Voir toutes les notifications
          </button>
        </div>

        {/* Témoignages / Avis Card */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--cj-blue)] text-white shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Vos témoignages & avis
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Partagez votre expérience et donnez votre avis sur vos
                formations.
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/espace-etudiants/temoignages`}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--cj-blue)] py-2 text-xs font-bold text-white transition hover:bg-[var(--cj-blue-700)] shadow-sm"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Partager mon témoignage
          </Link>
        </div>

        {/* Quick Support / Questions form */}
        <div className="rounded-2xl border border-white bg-white/60 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            Poser une question
          </h3>
          <p className="text-[11px] text-slate-500 leading-normal mb-4">
            Une difficulté sur un cours ou un paiement ? Écrivez directement
            au secrétariat académique.
          </p>

          <form onSubmit={sendQuestion} className="space-y-3">
            {questionError && (
              <p className="rounded-xl bg-red-50 p-3 text-[10px] text-red-600 border border-red-100">
                {questionError}
              </p>
            )}
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="Votre message..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-[var(--cj-blue)] focus:ring-4 focus:ring-blue-100 outline-none"
            />
            <button
              type="submit"
              disabled={questionLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-blue)] py-2 text-xs font-semibold text-white transition hover:bg-[var(--cj-blue-700)] disabled:opacity-50"
            >
              {questionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Envoyer ma demande
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
