"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileCheck,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";

export interface UploadedFileData {
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  key: string;
}

export interface UploadFileStateItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  errorMessage?: string;
  data?: UploadedFileData;
}

interface AssignmentSubmitModalProps {
  selectedAssignment: any;
  onClose: () => void;
  onSubmit: (uploadedFiles: UploadedFileData[]) => Promise<void>;
  uploadErrorMessage: string;
  uploadSuccessMessage: string;
  isSubmittingWork: boolean;
}

export function AssignmentSubmitModal({
  selectedAssignment,
  onClose,
  onSubmit,
  uploadErrorMessage,
  uploadSuccessMessage,
  isSubmittingWork,
}: AssignmentSubmitModalProps) {
  const [fileItems, setFileItems] = useState<UploadFileStateItem[]>([]);
  const [validationError, setValidationError] = useState<string>("");
  const xhrMapRef = useRef<Map<string, XMLHttpRequest>>(new Map());

  // Abort all active XHR uploads when unmounting or when selectedAssignment changes
  const abortAllUploads = () => {
    xhrMapRef.current.forEach((xhr) => {
      try {
        xhr.abort();
      } catch {}
    });
    xhrMapRef.current.clear();
  };

  useEffect(() => {
    // Reset file list and abort old requests when modal opens or assignment changes
    abortAllUploads();
    setFileItems([]);
    setValidationError("");

    return () => {
      abortAllUploads();
    };
  }, [selectedAssignment]);

  if (!selectedAssignment) return null;

  const maxFileSizeMb = selectedAssignment.maxFileSize || 10;
  const maxBytes = maxFileSizeMb * 1024 * 1024;
  const allowedTypesArray: string[] = selectedAssignment.allowedFileTypes
    ? (Array.isArray(selectedAssignment.allowedFileTypes)
        ? selectedAssignment.allowedFileTypes
        : String(selectedAssignment.allowedFileTypes).split(","))
        .map((t: string) => t.trim().toLowerCase().replace(/^\./, ""))
    : ["pdf", "doc", "docx", "zip", "rar", "png", "jpg", "jpeg"];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCloseModal = () => {
    abortAllUploads();
    onClose();
  };

  const uploadFileToServer = (item: UploadFileStateItem) => {
    // Cancel previous XHR if retrying
    if (xhrMapRef.current.has(item.id)) {
      try {
        xhrMapRef.current.get(item.id)?.abort();
      } catch {}
      xhrMapRef.current.delete(item.id);
    }

    setFileItems((prev) =>
      prev.map((f) =>
        f.id === item.id ? { ...f, status: "uploading", progress: 0, errorMessage: undefined } : f
      )
    );

    const xhr = new XMLHttpRequest();
    xhrMapRef.current.set(item.id, xhr);
    xhr.timeout = 60000; // 60 seconds timeout

    const formData = new FormData();
    formData.append("file", item.file);
    formData.append("assignmentId", String(selectedAssignment.id));
    formData.append("maxFileSize", String(maxFileSizeMb));

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setFileItems((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, progress: percent } : f))
        );
      }
    });

    xhr.addEventListener("load", () => {
      xhrMapRef.current.delete(item.id);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.success && res.file && res.file.url) {
            setFileItems((prev) =>
              prev.map((f) =>
                f.id === item.id
                  ? { ...f, status: "completed", progress: 100, data: res.file }
                  : f
              )
            );
          } else {
            setFileItems((prev) =>
              prev.map((f) =>
                f.id === item.id
                  ? {
                      ...f,
                      status: "error",
                      errorMessage: res.error || "Erreur de téléversement : URL non générée",
                    }
                  : f
              )
            );
          }
        } catch {
          setFileItems((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, status: "error", errorMessage: "Format de réponse du serveur invalide" }
                : f
            )
          );
        }
      } else {
        let errorText = `Erreur serveur (${xhr.status})`;
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.error) errorText = res.error;
        } catch {}
        setFileItems((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "error", errorMessage: errorText } : f
          )
        );
      }
    });

    xhr.addEventListener("error", () => {
      xhrMapRef.current.delete(item.id);
      setFileItems((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: "error",
                errorMessage: "Échec de connexion réseau lors du téléversement",
              }
            : f
        )
      );
    });

    xhr.addEventListener("timeout", () => {
      xhrMapRef.current.delete(item.id);
      setFileItems((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: "error",
                errorMessage: "Le téléversement a expiré (délai de 60s dépassé). Veuillez réessayer.",
              }
            : f
        )
      );
    });

    xhr.addEventListener("abort", () => {
      xhrMapRef.current.delete(item.id);
    });

    xhr.open("POST", "/api/student/upload");
    xhr.send(formData);
  };

  const handleFileSelection = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setValidationError("");

    const newFiles: File[] = Array.from(filesList);
    const maxFilesAllowed = selectedAssignment.maxFiles || 5;

    if (fileItems.length + newFiles.length > maxFilesAllowed) {
      setValidationError(`Vous ne pouvez pas envoyer plus de ${maxFilesAllowed} fichier(s) au total.`);
      return;
    }

    const itemsToAdd: UploadFileStateItem[] = [];

    for (const file of newFiles) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const itemId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      if (file.size > maxBytes) {
        itemsToAdd.push({
          id: itemId,
          file,
          progress: 0,
          status: "error",
          errorMessage: `Taille max dépassée (${formatFileSize(file.size)} > ${maxFileSizeMb} MB)`,
        });
      } else if (allowedTypesArray.length > 0 && !allowedTypesArray.includes(ext)) {
        itemsToAdd.push({
          id: itemId,
          file,
          progress: 0,
          status: "error",
          errorMessage: `Format .${ext} non autorisé (Formats acceptés : ${allowedTypesArray.join(", ")})`,
        });
      } else {
        const item: UploadFileStateItem = {
          id: itemId,
          file,
          progress: 0,
          status: "pending",
        };
        itemsToAdd.push(item);
      }
    }

    setFileItems((prev) => [...prev, ...itemsToAdd]);

    // Immediately trigger upload ONLY for valid pending files
    itemsToAdd.forEach((item) => {
      if (item.status === "pending") {
        uploadFileToServer(item);
      }
    });
  };

  const handleRemoveFile = (id: string) => {
    if (xhrMapRef.current.has(id)) {
      try {
        xhrMapRef.current.get(id)?.abort();
      } catch {}
      xhrMapRef.current.delete(id);
    }
    setFileItems((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRetryUpload = (item: UploadFileStateItem) => {
    uploadFileToServer(item);
  };

  const isUploading = fileItems.some((f) => f.status === "uploading" || f.status === "pending");
  const hasErrors = fileItems.some((f) => f.status === "error");
  const completedFiles = fileItems
    .filter((f) => f.status === "completed" && f.data && Boolean(f.data.url))
    .map((f) => f.data!);

  const canSubmit =
    fileItems.length > 0 &&
    !isUploading &&
    !hasErrors &&
    completedFiles.length === fileItems.length &&
    !isSubmittingWork;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(completedFiles);
  };

  const getSubmitButtonLabel = () => {
    if (isSubmittingWork) return "Envoi de votre travail en cours...";
    if (isUploading) return "Téléversement des fichiers en cours...";
    if (hasErrors) return "Veuillez corriger ou supprimer les fichiers en erreur";
    if (fileItems.length === 0) return "Sélectionnez au moins un fichier";
    if (completedFiles.length < fileItems.length) return "Téléversement incomplet";
    return "Déposer mon travail";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[linear-gradient(120deg,#001737_0%,#002d72_52%,#0c4da2_100%)] px-6 py-5 text-white flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">
              Téléverser mon travail
            </p>
            <h3 className="text-sm font-bold mt-1 line-clamp-1">
              {selectedAssignment.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Alerts */}
          {validationError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{validationError}</span>
            </div>
          )}
          {uploadErrorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{uploadErrorMessage}</span>
            </div>
          )}
          {uploadSuccessMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{uploadSuccessMessage}</span>
            </div>
          )}

          {/* Fichiers Joints / Consignes */}
          {selectedAssignment.AssignmentFile && selectedAssignment.AssignmentFile.length > 0 && (
            <div className="space-y-2 mb-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--cj-blue)]" />
                Consignes / Documents joints
              </label>
              <div className="grid gap-2 sm:grid-cols-2 mt-2">
                {selectedAssignment.AssignmentFile.map((file: any) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white p-2.5 text-xs font-semibold text-slate-700 hover:text-[var(--cj-blue)] hover:border-blue-300 hover:shadow-sm transition"
                  >
                    <Download className="w-4 h-4 shrink-0 text-[var(--cj-blue)]" />
                    <span className="truncate" title={file.originalName || file.name}>
                      {file.originalName || file.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Upload Input Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Sélectionner mon fichier de rendu *
            </label>

            <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/70 hover:bg-blue-50/30 hover:border-blue-400 transition cursor-pointer">
              <input
                type="file"
                multiple
                onChange={(e) => {
                  handleFileSelection(e.target.files);
                  e.target.value = ""; // allow re-selecting same file if removed
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-[var(--cj-blue)] mb-1 transition" />
              <p className="text-xs font-semibold text-slate-700">
                Cliquez ou glissez-déposez vos fichiers ici
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Taille max : {maxFileSizeMb} MB par fichier. Formats :{" "}
                {allowedTypesArray.join(", ")}.
              </p>
            </div>
          </div>

          {/* Files List with Realtime Progress */}
          {fileItems.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Fichiers sélectionnés ({fileItems.length})
              </p>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {fileItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition text-xs space-y-1.5 ${
                        item.status === "completed"
                          ? "bg-emerald-50/60 border-emerald-200"
                          : item.status === "error"
                          ? "bg-red-50/60 border-red-200"
                          : "bg-white border-slate-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {item.status === "completed" ? (
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : item.status === "error" ? (
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                          ) : item.status === "uploading" || item.status === "pending" ? (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div className="overflow-hidden">
                            <p className="font-semibold text-slate-800 truncate text-[11px]">
                              {item.file.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {formatFileSize(item.file.size)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {item.status === "error" && (
                            <button
                              type="button"
                              onClick={() => handleRetryUpload(item)}
                              title="Réessayer le téléversement"
                              className="p-1 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(item.id)}
                            title="Supprimer ce fichier"
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {(item.status === "uploading" || item.status === "pending") && (
                        <div className="space-y-1">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[var(--cj-blue)] h-full transition-all duration-150 ease-out"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] font-semibold text-slate-500">
                            <span>Téléversement en cours...</span>
                            <span>{item.progress}%</span>
                          </div>
                        </div>
                      )}

                      {/* Status Badges */}
                      {item.status === "completed" && (
                        <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Téléversement terminé avec succès. Fichier prêt.
                        </p>
                      )}

                      {item.status === "error" && item.errorMessage && (
                        <p className="text-[10px] font-semibold text-red-600">
                          {item.errorMessage}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 justify-end border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseModal}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--cj-blue)] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--cj-blue-700)] disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
              {isSubmittingWork || isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {getSubmitButtonLabel()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
