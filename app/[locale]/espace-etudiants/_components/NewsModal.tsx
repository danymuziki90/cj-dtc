"use client";

import { Newspaper, X } from "lucide-react";
import { formatDate } from "./utils";

interface NewsModalProps {
  selectedNews: any;
  onClose: () => void;
}

export function NewsModal({ selectedNews, onClose }: NewsModalProps) {
  if (!selectedNews) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative h-60 overflow-hidden bg-slate-900 flex items-center justify-center text-white">
          {selectedNews.imageData ? (
            <img
              src={selectedNews.imageData}
              alt={selectedNews.title}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <Newspaper className="w-16 h-16 text-slate-700" />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            <span>Catégorie : {selectedNews.category}</span>
            <span>Publié le {formatDate(selectedNews.createdAt)}</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {selectedNews.title}
          </h3>

          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {selectedNews.content}
          </p>
        </div>

        <div className="bg-slate-50 p-4 flex justify-end border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            Fermer la lecture
          </button>
        </div>
      </div>
    </div>
  );
}
