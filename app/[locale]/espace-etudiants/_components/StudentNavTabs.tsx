"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  FileText,
  HelpCircle,
  MessageSquare,
  Newspaper,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface StudentNavTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalFormationsCount: number;
  pendingAssignmentsCount: number;
  newsCount: number;
  totalNotifications: number;
  locale: string;
}

type StudentTab = {
  id: string;
  label: string;
  icon: typeof BarChart3;
  count: number | null;
  href: string | null;
};

export function StudentNavTabs({
  activeTab,
  setActiveTab,
  totalFormationsCount,
  pendingAssignmentsCount,
  newsCount,
  totalNotifications,
  locale,
}: StudentNavTabsProps) {
  const pathname = usePathname();
  const t = useTranslations('student');

  const tabs: StudentTab[] = [
    { id: "overview",       label: t('dashboard'),      icon: BarChart3,   count: null,                 href: null },
    { id: "formations",     label: t('my_formations'),  icon: BookOpen,    count: totalFormationsCount, href: null },
    { id: "travaux",        label: t('my_assignments'), icon: FileText,    count: pendingAssignmentsCount, href: null },
    { id: "news",           label: t('news'),           icon: Newspaper,   count: newsCount,            href: null },
    { id: "calendrier",     label: t('calendar'),       icon: Calendar,    count: null,                 href: null },
    { id: "notifications",  label: t('notifications'),  icon: Bell,        count: totalNotifications,   href: null },
    { id: "certificats",    label: "Mes certificats",   icon: Award,       count: null,                 href: `/${locale}/espace-etudiants/mes-certificats` },
    { id: "support",        label: t('support'),        icon: HelpCircle,  count: null,                 href: null },
  ];

  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white/95 px-2 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md overflow-hidden">
      {/* Scroll horizontal sur mobile, flex-wrap sur desktop */}
      <nav
        className="flex gap-1.5 overflow-x-auto sm:flex-wrap"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href
            ? pathname === tab.href || pathname.startsWith(`${tab.href}/`)
            : activeTab === tab.id;

          if (tab.href) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`group flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold transition-all duration-200 focus:outline-none sm:px-4 ${
                  isActive
                    ? "bg-[var(--cj-blue)] text-white shadow-md shadow-blue-900/10 scale-[1.02]"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    isActive ? "text-white scale-110" : "text-slate-400 group-hover:scale-110"
                  }`}
                />
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                      isActive
                        ? "bg-white text-[var(--cj-blue)]"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold transition-all duration-200 focus:outline-none sm:px-4 ${
                isActive
                  ? "bg-[var(--cj-blue)] text-white shadow-md shadow-blue-900/10 scale-[1.02]"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                  isActive ? "text-white scale-110" : "text-slate-400 group-hover:scale-110"
                }`}
              />
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                    isActive
                      ? "bg-white text-[var(--cj-blue)]"
                      : tab.count > 0 ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
        <Link
          href={`/${locale}/espace-etudiants/temoignages`}
          className="group flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--cj-red)] to-red-600 px-3 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200 sm:px-4"
        >
          <MessageSquare className="h-4 w-4 shrink-0 text-white transition-transform group-hover:scale-110" />
          <span className="whitespace-nowrap">Témoignages & Avis</span>
        </Link>
      </nav>
    </div>
  );
}
