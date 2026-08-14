"use client";

import Link from "next/link";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Laptop,
  ArrowRight,
} from "lucide-react";
import { StudentEmptyState as EmptyState } from "@/components/ui/student-space";
import {
  formatDateShort,
  getGradientForCategory,
  statusClass,
  translateEnrollmentStatus,
} from "./utils";
import { publicMessages } from "@/lib/i18n/public-messages";

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
  const tBase = publicMessages.espaceEtudiants[locale as "fr" | "en"] ?? publicMessages.espaceEtudiants.fr;
  const t = tBase.formations;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {t.title}
          </h3>
          <p className="text-xs text-slate-500">
            {t.desc}
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
                      alt={locale === "fr" ? item.formationTitle : (item.formationTitleEn || item.formationTitle)}
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
                      {locale === "fr" ? item.formationTitle : (item.formationTitleEn || item.formationTitle)}
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
                    {item.formationCategory || t.program}
                  </span>

                  <h4 className="mt-3 text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {locale === "fr" ? item.formationTitle : (item.formationTitleEn || item.formationTitle)}
                  </h4>

                  <p className="mt-2 text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                    {locale === "fr"
                      ? (item.formationDescription || t.noDesc)
                      : (item.formationDescriptionEn || item.formationDescription || t.noDesc)}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">{t.dates}</span>
                      <span className="font-semibold text-slate-700">
                        {formatDateShort(item.startDate)} -{" "}
                        {formatDateShort(item.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">{t.status}</span>
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
                        {t.progress}
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
                        {t.progress}
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
                    <div className="grid grid-cols-2 gap-2 mt-1 text-center border-t border-slate-100 pt-3 sm:grid-cols-3">
                      <button
                        onClick={() => setActiveTab("calendrier")}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-[10px] text-slate-600 hover:text-[var(--cj-blue)] font-bold transition-all"
                        title={t.calendar}
                      >
                        <Calendar className="w-4 h-4 mb-1 text-slate-400" />
                        {t.calendar}
                      </button>
                      <Link
                        href={`${basePath}/supports?formationId=${item.formationId}`}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-[10px] text-slate-600 hover:text-[var(--cj-blue)] font-bold transition-all"
                        title={t.materials}
                      >
                        <BookOpen className="w-4 h-4 mb-1 text-slate-400" />
                        {t.materials}
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-center text-xs space-y-1">
                    {item.enrollmentStatus === "waitlist" && (
                      <>
                        <p className="font-extrabold text-amber-700">
                          {t.statuses.waitlist}
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          {t.statuses.waitlistDesc}
                        </p>
                      </>
                    )}
                    {item.enrollmentStatus === "pending" && (
                      <>
                        <p className="font-extrabold text-blue-700">
                          {t.statuses.pending}
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          {t.statuses.pendingDesc}
                        </p>
                      </>
                    )}
                    {item.enrollmentStatus === "rejected" && (
                      <>
                        <p className="font-extrabold text-red-600">
                          {t.statuses.rejected}
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          {t.statuses.rejectedDesc}
                        </p>
                      </>
                    )}
                    {item.enrollmentStatus === "cancelled" && (
                      <>
                        <p className="font-extrabold text-slate-650">
                          {t.statuses.cancelled}
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          {t.statuses.cancelledDesc}
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
              title={t.emptyTitle}
              description={t.emptyDesc}
            />
          </div>
        )}
      </div>

      {/* Sessions ouvertes */}
      <div className="mt-8 space-y-5 sm:mt-12 sm:space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{t.openSessions}</h3>
          <p className="text-xs text-slate-500">
            {t.openSessionsDesc}
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
                    {session.formationCategory || t.program}
                  </span>

                  <h4 className="mt-3 text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {session.formationTitle}
                  </h4>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">{t.dates}</span>
                      <span className="font-semibold text-slate-700">
                        {formatDateShort(session.startDate)} -{" "}
                        {formatDateShort(session.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">
                        {t.location}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {session.location} ({session.format})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">
                        {t.spots}
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
                  {t.viewDetails}
                </Link>
                <Link
                  href={`/${locale}/espace-etudiants/confirm-inscription?formationId=${session.formationId}&sessionId=${session.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--cj-red)] py-2 text-xs font-semibold text-white hover:bg-[var(--cj-red-700)] transition text-center shadow-sm"
                >
                  {t.enrollBtn}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {availableSessions.length === 0 && (
            <div className="col-span-full py-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                {t.noOpenSessions}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
