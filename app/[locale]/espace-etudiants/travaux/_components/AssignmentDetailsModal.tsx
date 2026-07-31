"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { 
  X, 
  FileText, 
  Download, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  RefreshCw,
  Trash2,
  CalendarDays,
  Clock,
  Award,
  MessageSquare
} from "lucide-react";
import { getAssignmentStatus } from "../../_components/utils";

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

interface AssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
}

export default function AssignmentDetailsModal({ isOpen, onClose, assignment }: AssignmentDetailsModalProps) {
  const [fileItems, setFileItems] = useState<UploadFileStateItem[]>([]);
  const [validationError, setValidationError] = useState<string>("");
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
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
    abortAllUploads();
    setFileItems([]);
    setValidationError("");
    setUploadErrorMessage("");
    setUploadSuccessMessage("");
    setIsSubmittingWork(false);

    return () => abortAllUploads();
  }, [assignment]);

  if (!isOpen || !assignment) return null;

  const maxFileSizeMb = assignment.maxFileSize || 10;
  const maxBytes = maxFileSizeMb * 1024 * 1024;
  const allowedTypesArray: string[] = assignment.allowedFileTypes
    ? (Array.isArray(assignment.allowedFileTypes)
        ? assignment.allowedFileTypes
        : String(assignment.allowedFileTypes).split(","))
        .map((t: string) => t.trim().toLowerCase().replace(/^\./, ""))
    : ["pdf", "doc", "docx", "zip", "rar", "png", "jpg", "jpeg"];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusInfo = getAssignmentStatus(assignment);
  const isPastDeadline = new Date(assignment.deadline).getTime() < Date.now();
  const submission = assignment.submissions?.[0];
  const canSubmit = !isPastDeadline && statusInfo.status !== "graded" && (assignment.allowResubmission || !submission);

  // Upload Logic (Adapted from existing modal)
  const uploadFileToServer = (item: UploadFileStateItem) => {
    if (xhrMapRef.current.has(item.id)) {
      try { xhrMapRef.current.get(item.id)?.abort(); } catch {}
      xhrMapRef.current.delete(item.id);
    }

    setFileItems((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: "uploading", progress: 0, errorMessage: undefined } : f))
    );

    const xhr = new XMLHttpRequest();
    xhrMapRef.current.set(item.id, xhr);
    xhr.timeout = 60000;

    const formData = new FormData();
    formData.append("file", item.file);
    formData.append("assignmentId", String(assignment.id));
    formData.append("maxFileSize", String(maxFileSizeMb));

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setFileItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, progress: percent } : f)));
      }
    });

    xhr.addEventListener("load", () => {
      xhrMapRef.current.delete(item.id);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.success && res.file && res.file.url) {
            setFileItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "completed", progress: 100, data: res.file } : f)));
          } else {
            setFileItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "error", errorMessage: res.error || "Erreur serveur" } : f)));
          }
        } catch {
          setFileItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "error", errorMessage: "Format de réponse invalide" } : f)));
        }
      } else {
        setFileItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "error", errorMessage: `Erreur ${xhr.status}` } : f)));
      }
    });

    xhr.addEventListener("error", () => {
      xhrMapRef.current.delete(item.id);
      setFileItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "error", errorMessage: "Erreur réseau" } : f)));
    });

    xhr.open("POST", "/api/student/upload");
    xhr.send(formData);
  };

  const handleFileSelection = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setValidationError("");

    const newFiles = Array.from(filesList);
    const maxFilesAllowed = assignment.maxFiles || 5;

    if (fileItems.length + newFiles.length > maxFilesAllowed) {
      setValidationError(`Vous ne pouvez pas envoyer plus de ${maxFilesAllowed} fichiers.`);
      return;
    }

    const itemsToAdd: UploadFileStateItem[] = newFiles.map((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const itemId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      if (file.size > maxBytes) {
        return { id: itemId, file, progress: 0, status: "error", errorMessage: `Taille max dépassée (${maxFileSizeMb}MB)` };
      }
      if (allowedTypesArray.length > 0 && !allowedTypesArray.includes(ext)) {
        return { id: itemId, file, progress: 0, status: "error", errorMessage: `Format .${ext} non autorisé` };
      }
      return { id: itemId, file, progress: 0, status: "pending" };
    });

    setFileItems((prev) => [...prev, ...itemsToAdd]);
    itemsToAdd.forEach((item) => {
      if (item.status === "pending") uploadFileToServer(item);
    });
  };

  const handleSubmitFinal = async (e: FormEvent) => {
    e.preventDefault();
    const completedFiles = fileItems.filter((f) => f.status === "completed" && f.data).map((f) => f.data!);
    if (completedFiles.length === 0) return;

    setIsSubmittingWork(true);
    setUploadErrorMessage("");
    setUploadSuccessMessage("");

    try {
      const response = await fetch("/api/student/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          files: completedFiles,
        }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || "Échec de l'envoi");

      setUploadSuccessMessage("Votre travail a été déposé avec succès !");
      setTimeout(() => {
        onClose(); // Automatically close and refresh
      }, 2000);
    } catch (err: any) {
      setUploadErrorMessage(err.message);
    } finally {
      setIsSubmittingWork(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border ${statusInfo.className}`}>
              <statusInfo.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {assignment.type?.toUpperCase() || "DEVOIR"}
              </p>
              <h2 className="text-base font-bold text-slate-900">{assignment.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body - Split View */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          
          {/* Left Column: Details */}
          <div className="w-full md:w-[55%] p-6 md:p-8 md:border-r border-slate-100">
            <div className="flex flex-wrap gap-4 mb-6">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase border ${statusInfo.className}`}>
                <statusInfo.icon className="h-3.5 w-3.5" />
                {statusInfo.label}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-full px-3 py-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Échéance : {new Date(assignment.deadline).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="prose prose-sm prose-slate max-w-none">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Instructions</h3>
              <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
                {assignment.description}
              </p>
              
              {assignment.instructions && (
                <div className="mt-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-blue-900">
                  {assignment.instructions}
                </div>
              )}
            </div>

            {/* Teacher Attachments */}
            {assignment.files && assignment.files.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Download className="h-4 w-4 text-slate-400" />
                  Ressources à télécharger
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assignment.files.map((file: any) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:border-[var(--cj-blue)] hover:shadow-sm transition-all group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[var(--cj-blue)] group-hover:bg-[var(--cj-blue)] group-hover:text-white transition-colors">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate text-xs font-semibold text-slate-700">{file.originalName || file.name}</p>
                        <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Submission Area */}
          <div className="w-full md:w-[45%] p-6 md:p-8 bg-slate-50/50">
            {/* If Graded */}
            {statusInfo.status === "graded" && submission ? (
              <div className="space-y-6">
                <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 p-6 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">Évaluation finale</h3>
                  </div>
                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-5xl font-black">{submission.grade}</span>
                    <span className="text-xl font-medium text-emerald-100 mb-1">/ 20</span>
                  </div>
                </div>

                {submission.feedback && (
                  <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-[var(--cj-blue)]">
                      <MessageSquare className="h-5 w-5" />
                      <h4 className="font-bold">Commentaire de l'enseignant</h4>
                    </div>
                    <p className="text-sm text-slate-600 italic">"{submission.feedback}"</p>
                  </div>
                )}
                
                {/* Previous Submission Files */}
                {submission.SubmissionFile && submission.SubmissionFile.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Votre rendu</h4>
                    <div className="space-y-2">
                      {submission.SubmissionFile.map((f: any) => (
                        <div key={f.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200">
                          <FileText className="h-5 w-5 text-slate-400" />
                          <span className="text-xs font-medium text-slate-700 truncate">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Upload Area */
              <div className="flex flex-col h-full">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Déposer votre travail</h3>
                
                {/* Previous Submission Info */}
                {submission && (
                  <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 mb-3">
                      <CheckCircle2 className="h-4 w-4" /> Un travail a déjà été remis.
                    </p>
                    <div className="space-y-2">
                      {submission.SubmissionFile?.map((f: any) => (
                        <div key={f.id} className="text-xs text-slate-600 flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-slate-400" /> {f.name}
                        </div>
                      ))}
                    </div>
                    {canSubmit && (
                      <p className="mt-3 text-[10px] text-slate-500">
                        Vous pouvez téléverser de nouveaux fichiers pour remplacer votre rendu précédent (avant la date limite).
                      </p>
                    )}
                  </div>
                )}

                {!canSubmit ? (
                  <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-6 text-center text-red-600">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">La date limite est dépassée.</p>
                    <p className="text-xs mt-1 opacity-80">Vous ne pouvez plus soumettre ou modifier ce travail.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFinal} className="flex flex-col flex-1">
                    {/* Upload Dropzone */}
                    <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-[24px] p-8 bg-white hover:bg-blue-50/50 hover:border-blue-400 transition-all cursor-pointer mb-4">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          handleFileSelection(e.target.files);
                          e.target.value = "";
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-[var(--cj-blue)] group-hover:text-white transition-colors mb-3 shadow-sm">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 text-center">
                        Glissez-déposez ou cliquez
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 text-center max-w-[200px]">
                        Taille max: {maxFileSizeMb} MB. <br/>
                        Formats: {allowedTypesArray.join(", ")}
                      </p>
                    </div>

                    {/* Messages */}
                    {validationError && <p className="text-xs text-red-600 mb-2">{validationError}</p>}
                    {uploadErrorMessage && <p className="text-xs text-red-600 mb-2">{uploadErrorMessage}</p>}
                    {uploadSuccessMessage && <p className="text-xs text-emerald-600 mb-2 font-bold">{uploadSuccessMessage}</p>}

                    {/* File List */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-1 min-h-[100px]">
                      {fileItems.map((item) => (
                        <div key={item.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-700 truncate">{item.file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (xhrMapRef.current.has(item.id)) {
                                  try { xhrMapRef.current.get(item.id)?.abort(); } catch {}
                                  xhrMapRef.current.delete(item.id);
                                }
                                setFileItems(prev => prev.filter(f => f.id !== item.id));
                              }}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {(item.status === "uploading" || item.status === "pending") && (
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div className="bg-[var(--cj-blue)] h-full transition-all" style={{ width: `${item.progress}%` }} />
                            </div>
                          )}
                          
                          {item.status === "error" && <p className="text-[10px] text-red-500 mt-1">{item.errorMessage}</p>}
                          {item.status === "completed" && <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Prêt</p>}
                        </div>
                      ))}
                    </div>

                    {/* Submit Action */}
                    <button
                      type="submit"
                      disabled={fileItems.length === 0 || isSubmittingWork || fileItems.some(f => f.status !== "completed")}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--cj-blue)] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[var(--cj-blue-700)] disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                    >
                      {isSubmittingWork ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                      Valider ma remise
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
