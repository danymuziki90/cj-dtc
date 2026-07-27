"use client";

import Link from "next/link";
import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  FileText,
  HelpCircle,
  MessageSquare,
  Newspaper,
} from "lucide-react";

interface StudentNavTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalFormationsCount: number;
  newsCount: number;
  totalNotifications: number;
  locale: string;
}

export function StudentNavTabs({
  activeTab,
  setActiveTab,
  totalFormationsCount,
  newsCount,
  totalNotifications,
  locale,
}: StudentNavTabsProps) {
  const tabs = [
    { id: "overview", label: "Tableau de bord", icon: BarChart3, count: null, href: null },
    { id: "formations", label: "Mes formations", icon: BookOpen, count: totalFormationsCount, href: null },
    { id: "news", label: "Actualités", icon: Newspaper, count: newsCount, href: null },
    { id: "calendrier", label: "Calendrier", icon: Calendar, count: null, href: null },
    { id: "notifications", label: "Notifications", icon: Bell, count: totalNotifications, href: null },
    { id: "support", label: "Support & Questions", icon: HelpCircle, count: null, href: null },
  ];

  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white/95 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
      <nav className="flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.href) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`group flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 focus:outline-none ${
                  isActive
                    ? "bg-[var(--cj-blue)] text-white shadow-md shadow-blue-900/10 scale-[1.02]"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isActive ? "text-white scale-110" : "text-slate-400 group-hover:scale-110"
                  }`}
                />
                <span>{tab.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 focus:outline-none ${
                isActive
                  ? "bg-[var(--cj-blue)] text-white shadow-md shadow-blue-900/10 scale-[1.02]"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-transform duration-200 ${
                  isActive ? "text-white scale-110" : "text-slate-400 group-hover:scale-110"
                }`}
              />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    isActive
                      ? "bg-white text-[var(--cj-blue)]"
                      : "bg-slate-200 text-slate-700"
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
          className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--cj-red)] to-red-600 px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          <MessageSquare className="h-4 w-4 text-white transition-transform group-hover:scale-110" />
          Témoignages & Avis
        </Link>
      </nav>
    </div>
  );
}
