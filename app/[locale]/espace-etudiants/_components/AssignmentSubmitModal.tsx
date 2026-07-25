"use client";

import { FormEvent } from "react";
import { Loader2, Upload, X } from "lucide-react";

interface AssignmentSubmitModalProps {
  selectedAssignment: any;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  uploadErrorMessage: string;
  uploadSuccessMessage: string;
  setUploadFiles: (files: FileList | null) => void;
  isSubmittingWork: boolean;
}

export function AssignmentSubmitModal({
  selectedAssignment,
  onClose,
  onSubmit,
  uploadErrorMessage,
  uploadSuccessMessage,
  setUploadFiles,
  isSubmittingWork,
}: AssignmentSubmitModalProps) {
  if (!selectedAssignment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[linear-gradient(120deg,#001737_0%,#002d72_52%,#0c4da2_100%)] px-6 py-5 text-white flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">
              Téléverser mon fichier
            </p>
            <h3 className="text-sm font-bold mt-1 line-clamp-1">
              {selectedAssignment.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {uploadErrorMessage && (
            <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
              {uploadErrorMessage}
            </p>
          )}
          {uploadSuccessMessage && (
            <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-600 border border-emerald-100">
              {uploadSuccessMessage}
            </p>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Fichiers de rendu *
            </label>
            <input
              type="file"
              multiple
              required
              onChange={(e) => setUploadFiles(e.target.files)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-950 shadow-sm outline-none focus:border-[var(--cj-blue)] focus:ring-4 focus:ring-blue-100"
            />
            <p className="text-[10px] text-slate-400">
              Taille max autorisée : {selectedAssignment.maxFileSize || 10} MB par fichier. <br />
              Formats autorisés :{" "}
              {selectedAssignment.allowedFileTypes?.join(", ") ||
                "pdf, doc, docx, zip"}
              .
            </p>
          </div>

          <div className="flex gap-2 pt-2 justify-end border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmittingWork}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--cj-blue)] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--cj-blue-700)] disabled:opacity-60 shadow"
            >
              {isSubmittingWork ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              Déposer mon travail
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
