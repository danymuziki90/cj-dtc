"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, FileIcon, Loader2, AlertCircle } from "lucide-react";

export interface UploadedFileData {
  url: string;
  name: string;
  size: number;
  type: string;
}

interface SubmitWorkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (files: UploadedFileData[]) => Promise<void>;
  assignmentTitle: string;
  isSubmitting: boolean;
  errorMessage?: string;
}

export function SubmitWorkDialog({
  isOpen,
  onClose,
  onSubmit,
  assignmentTitle,
  isSubmitting,
  errorMessage,
}: SubmitWorkDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setLocalError("");
    }
  };

  const handleUploadAndSubmit = async () => {
    if (!selectedFile) {
      setLocalError("Veuillez sélectionner un fichier.");
      return;
    }

    setIsUploading(true);
    setLocalError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      // We pass the context to put it in the right R2 folder
      formData.append("context", "student_submission");

      const uploadRes = await fetch("/api/student/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success || !uploadData.file?.url) {
        throw new Error(uploadData.error || "Erreur lors de l'upload du fichier.");
      }

      const uploadedFile: UploadedFileData = {
        url: uploadData.file.url,
        name: uploadData.file.name || selectedFile.name,
        size: uploadData.file.size ?? selectedFile.size,
        type: uploadData.file.mimeType || selectedFile.type || "application/octet-stream",
      };

      await onSubmit([uploadedFile]);
      // reset on success
      setSelectedFile(null);
    } catch (err: any) {
      setLocalError(err.message || "Une erreur est survenue.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800">
                Déposer mon travail
              </h2>
              <button
                onClick={onClose}
                disabled={isUploading || isSubmitting}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-600">
                Pour le devoir : <span className="font-bold text-[var(--cj-blue)]">{assignmentTitle}</span>
              </p>

              {(errorMessage || localError) && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{errorMessage || localError}</p>
                </div>
              )}

              <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 transition-colors hover:bg-blue-50">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  disabled={isUploading || isSubmitting}
                />
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    Cliquez ou glissez un fichier ici
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF, Word, Excel, ZIP (Max 10 Mo)
                  </p>
                </div>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <FileIcon className="h-5 w-5 text-blue-500 shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-bold text-slate-700">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} Mo
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading || isSubmitting}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUploading || isSubmitting}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleUploadAndSubmit}
                  disabled={!selectedFile || isUploading || isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[var(--cj-blue)] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-800 transition disabled:opacity-50"
                >
                  {(isUploading || isSubmitting) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isUploading ? "Envoi du fichier..." : isSubmitting ? "Enregistrement..." : "Soumettre"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
