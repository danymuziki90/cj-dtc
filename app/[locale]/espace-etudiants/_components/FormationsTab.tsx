"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  Laptop,
} from "lucide-react";
import { StudentEmptyState as EmptyState } from "@/components/ui/student-space";
import {
  formatDateShort,
  getGradientForCategory,
  statusClass,
  translateEnrollmentStatus,
} from "./utils";

interface FormationsTabProps {
  sessionsHistory: any[];
  availableSessions: any[];
  completionRate: number;
  setActiveTab: (tab: string) => void;
  basePath: string;
  locale: string;
}

export function FormationsTab({
  sessionsHistory,
  availableSessions,
  completionRate,
  setActiveTab,
  basePath,
  locale,
}: FormationsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Mes formations</h3>
          <p className="text-xs text-slate-500">
            Parcourez vos programmes d'apprentissage et suivez votre
            progression.
          </p>
        </div>
        <Link
          href={`${basePath}/elearning`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <Laptop className="w-4 h-4" />
          E-learning LMS
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sessionsHistory.map((item: any) => {
          const borderL =
            item.sessionLifecycle === "active"
              ? "border-l-4 border-l-orange-500"
              : "border-l-4 border-l-blue-600";
          return (
            <div
              key={item.enrollmentId}
              className={`group flex flex-col justify-between overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${borderL}`}
            >
              <div>
                {/* Course cover using formationImageUrl or gradient fallback */}
                {item.formationImageUrl ? (
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={item.formationImageUrl}
                      alt={item.formationTitle}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div
                    className={`relative h-44 bg-gradient-to-br ${getGradientForCategory(
                      item.formationCategory
                    )} flex items-center justify-center p-6 text-center text-white`}
                  >
                    <div className="absolute inset-0 bg-black/10" />
                    <GraduationCap className="absolute top-4 right-4 w-10 h-10 text-white/20" />
                    <p className="relative font-extrabold text-sm tracking-wide line-clamp-3">
                      {item.formationTitle}
                    </p>
                  </div>
                )}

                <div className="p-5">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      item.sessionLifecycle === "active"
                        ? "bg-orange-50 text-orange-700 border border-orange-100"
                        : "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}
                  >
                    {item.formationCategory || "Programme"}
                  </span>

                  <h4 className="mt-3 text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.formationTitle}
                  </h4>

                  <p className="mt-2 text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.formationDescription ||
                      "Aucune description fournie par l'administration."}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Dates</span>
                      <span className="font-semibold text-slate-700">
                        {formatDateShort(item.startDate)} -{" "}
                        {formatDateShort(item.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Statut</span>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${statusClass(
                          item.enrollmentStatus
                        )}`}
                      >
                        {translateEnrollmentStatus(item.enrollmentStatus)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5">
                {/* Individual progress bar */}
                {item.sessionLifecycle === "active" ? (
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">
                        Progression
                      </span>
                      <span className="font-bold text-orange-600">
                        {completionRate}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">
                        Progression
                      </span>
                      <span className="font-bold text-slate-500">
                        {item.sessionLifecycle === "completed" ? "100%" : "0%"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-slate-300"
                        style={{
                          width:
                            item.sessionLifecycle === "completed"
                              ? "100%"
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                )}

                {["accepted", "confirmed", "completed"].includes(
                  item.enrollmentStatus
                ) ? (
                  <>
                    <Link
                      href={`${basePath}/elearning`}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--cj-blue)] py-2 text-xs font-semibold text-white hover:bg-[var(--cj-blue-700)] transition text-center shadow-sm mb-3"
                    >
                      Continuer
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="grid grid-cols-2 gap-2 mt-1 text-center border-t border-slate-100 pt-3 sm:grid-cols-3">
                      <button
                        onClick={() => setActiveTab("calendrier")}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-[10px] text-slate-600 hover:text-[var(--cj-blue)] font-bold transition-all"
                        title="Consulter le calendrier"
                      >
                        <Calendar className="w-4 h-4 mb-1 text-slate-400" />
                        Calendrier
                      </button>
                      <Link
                        href={`${basePath}/supports?formationId=${item.formationId}`}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-[10px] text-slate-600 hover:text-[var(--cj-blue)] font-bold transition-all"
                        title="Accéder aux supports de cours"
                      >
                        <BookOpen className="w-4 h-4 mb-1 text-slate-400" />
                        Supports
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-center text-xs space-y-1">
                    {item.enrollmentStatus === "waitlist" && (
                      <>
                        <p className="font-extrabold text-amber-700">
                          ⏳ En liste d'attente
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          Votre candidature a été placée sur liste d'attente. Nous
                          vous contacterons dès qu'une place se libèrera.
                        </p>
                      </>
                    )}
                    {item.enrollmentStatus === "pending" && (
                      <>
                        <p className="font-extrabold text-blue-700">
                          🔍 Candidature en examen
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          Nos équipes examinent votre dossier. Une décision vous
                          sera notifiée très prochainement par e-mail.
                        </p>
                      </>
                    )}
                    {item.enrollmentStatus === "rejected" && (
                      <>
                        <p className="font-extrabold text-red-600">
                          ❌ Candidature non retenue
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          Votre dossier n'a pas été retenu pour cette session.
                          N'hésitez pas à postuler à d'autres parcours.
                        </p>
                      </>
                    )}
                    {item.enrollmentStatus === "cancelled" && (
                      <>
                        <p className="font-extrabold text-slate-650">
                          🚫 Inscription annulée
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          Cette inscription a été annulée. Veuillez contacter
                          le secrétariat pour toute question.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sessionsHistory.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <EmptyState
              title="Aucune formation enregistrée"
              description="Vous n'êtes inscrit à aucune formation de CJ DTC pour le moment."
            />
          </div>
        )}
      </div>

      {/* Sessions ouvertes */}
      <div className="mt-8 space-y-5 sm:mt-12 sm:space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Sessions ouvertes</h3>
          <p className="text-xs text-slate-500">
            Découvrez les opportunités d'apprentissage ouvertes à l'inscription.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableSessions.map((session: any) => (
            <div
              key={session.id}
              className="group flex flex-col justify-between overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-l-4 border-l-[var(--cj-red)]"
            >
              <div>
                {session.formationImageUrl ? (
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={session.formationImageUrl}
                      alt={session.formationTitle}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div
                    className={`relative h-44 bg-gradient-to-br ${getGradientForCategory(
                      session.formationCategory
                    )} flex items-center justify-center p-6 text-center text-white`}
                  >
                    <div className="absolute inset-0 bg-black/10" />
                    <GraduationCap className="absolute top-4 right-4 w-10 h-10 text-white/20" />
                    <p className="relative font-extrabold text-sm tracking-wide line-clamp-3">
                      {session.formationTitle}
                    </p>
                  </div>
                )}

                <div className="p-5">
                  <span className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-50 text-[var(--cj-red)] border border-red-100">
                    {session.formationCategory || "Programme"}
                  </span>

                  <h4 className="mt-3 text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {session.formationTitle}
                  </h4>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Dates</span>
                      <span className="font-semibold text-slate-700">
                        {formatDateShort(session.startDate)} -{" "}
                        {formatDateShort(session.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">
                        Lieu / Format
                      </span>
                      <span className="font-semibold text-slate-700">
                        {session.location} ({session.format})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">
                        Places restantes
                      </span>
                      <span className="font-semibold text-slate-700">
                        {session.availableSpots} /{" "}
                        {session.maxParticipants || 25}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 flex gap-2">
                <Link
                  href={`/${locale}/formations/${session.formationSlug}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-2 text-xs font-semibold text-slate-700 hover:border-[var(--cj-blue)] hover:text-[var(--cj-blue)] transition text-center"
                >
                  Voir les détails
                </Link>
                <Link
                  href={`/${locale}/espace-etudiants/confirm-inscription?formationId=${session.formationId}&sessionId=${session.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--cj-red)] py-2 text-xs font-semibold text-white hover:bg-[var(--cj-red-700)] transition text-center shadow-sm"
                >
                  S'inscrire à cette session
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {availableSessions.length === 0 && (
            <div className="col-span-full py-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Aucune autre session ouverte disponible pour le moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
