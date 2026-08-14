"use client";

import { FormEvent } from "react";
import { Clock3, Loader2, MessageSquare, Send } from "lucide-react";
import { formatDate, formatDateTime } from "./utils";

interface SupportTabProps {
  questions: any[];
  sendQuestion: (e: FormEvent) => void;
  question: string;
  setQuestion: (val: string) => void;
  questionError: string;
  questionLoading: boolean;
}

export function SupportTab({
  questions,
  sendQuestion,
  question,
  setQuestion,
  questionError,
  questionLoading,
}: SupportTabProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
      {/* Question submission form */}
      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-white bg-white/60 p-4 shadow-sm sm:p-6 lg:sticky lg:top-24">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Poser une question
          </h3>
          <p className="text-xs text-slate-500 mb-4 leading-normal">
            Nos secrétariats pédagogiques et administratifs s'engagent à vous
            répondre sous 24 à 48 heures ouvrées.
          </p>

          <form onSubmit={sendQuestion} className="space-y-4">
            {questionError && (
              <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                {questionError}
              </p>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Message *
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={5}
                required
                placeholder="Rédigez clairement votre question pédagogique ou demande d'assistance..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-[var(--cj-blue)] focus:ring-4 focus:ring-blue-100 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={questionLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-blue)] py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--cj-blue-700)] disabled:opacity-50 shadow"
            >
              {questionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Soumettre ma question
            </button>
          </form>
        </div>
      </div>

      {/* Past questions with admin answers list */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Historique de vos échanges
        </h3>

        <div className="space-y-3">
          {questions.map((item: any) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                <span className="text-[10px] font-bold text-[var(--cj-blue)] uppercase tracking-wider">
                  {item.formationTitle}
                </span>
                <span className="text-[10px] text-slate-400">
                  Posée le {formatDateTime(item.createdAt)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">
                    Votre question :
                  </p>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {item.adminReply ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs">
                    <div className="flex items-center justify-between font-semibold text-[var(--cj-blue)]">
                      <span>Réponse de l'administration</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {item.adminReplyAt ? formatDate(item.adminReplyAt) : ""}
                      </span>
                    </div>
                    <p className="mt-1.5 text-slate-700 leading-relaxed">
                      {item.adminReply}
                    </p>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full px-3 py-1 border border-amber-100">
                    <Clock3 className="w-3.5 h-3.5" />
                    En attente de réponse administrative
                  </div>
                )}
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <p className="text-xs text-slate-500 italic">
                Aucune question soumise pour le moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
