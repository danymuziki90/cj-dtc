"use client";

import { ArrowRight, Newspaper } from "lucide-react";
import { StudentEmptyState as EmptyState } from "@/components/ui/student-space";
import { formatDateShort } from "./utils";

interface NewsTabProps {
  news: any[];
  setSelectedNewsForModal: (news: any) => void;
}

export function NewsTab({ news, setSelectedNewsForModal }: NewsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">
          Actualités de CJ DTC
        </h3>
        <p className="text-xs text-slate-500">
          Restez informé des annonces administratives, événements et
          opportunités.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item: any) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-l-4 border-l-indigo-500"
          >
            <div>
              {item.imageData ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.imageData}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="relative h-48 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 flex items-center justify-center text-white">
                  <Newspaper className="w-12 h-12 text-indigo-300/80" />
                </div>
              )}

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-[9px] font-bold text-indigo-500 uppercase tracking-wider">
                  <span>{item.category || "Général"}</span>
                  <span>{formatDateShort(item.createdAt)}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-[var(--cj-blue)] transition line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {item.content}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => setSelectedNewsForModal(item)}
                className="w-full inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Lire la suite
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}

        {news.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <EmptyState
              title="Aucune actualité"
              description="Aucune publication récente de l'administration."
            />
          </div>
        )}
      </div>
    </div>
  );
}
