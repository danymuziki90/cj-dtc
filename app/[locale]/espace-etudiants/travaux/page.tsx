"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  FileText,
  Calendar,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  RefreshCw,
  FileCheck,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  StudentPageShell,
  StudentSectionCard,
} from "@/components/ui/student-space";

interface AssignmentFile {
  id: number;
  name: string;
  originalName: string;
  size: number;
  url: string;
}

interface SubmissionFile {
  id: number;
  name: string;
  originalName: string;
  size: number;
  url: string;
  mimeType: string;
}

interface Submission {
  id: number;
  status: string; // 'submitted', 'graded', 'returned'
  grade: number | null;
  feedback: string | null;
  submittedAt: string;
  files: SubmissionFile[];
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  objectives: string | null;
  type: "tp" | "exam" | "project";
  difficulty?: "debutant" | "intermediaire" | "avance";
  deadline: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  instructions: string | null;
  formation: {
    title: string;
  };
  files: AssignmentFile[];
  submissions: Submission[];
}

export default function StudentAssignmentsPage() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "fr";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // States par devoir (indexed by assignmentId)
  const [selectedFilesMap, setSelectedFilesMap] = useState<Record<number, FileList | null>>({});
  const [submittingMap, setSubmittingMap] = useState<Record<number, boolean>>({});
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const [errorMap, setErrorMap] = useState<Record<number, string>>({});
  const [successMap, setSuccessMap] = useState<Record<number, string>>({});
  const [replaceModeMap, setReplaceModeMap] = useState<Record<number, boolean>>({});

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/assignments");
      if (!res.ok) throw new Error("Erreur de chargement des travaux");
      const data = await res.json();
      setAssignments(data || []);
    } catch (err) {
      console.error("Fetch assignments error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Métriques calculées
  const metrics = useMemo(() => {
    const total = assignments.length;
    const submitted = assignments.filter((a) => a.submissions.length > 0).length;
    const graded = assignments.filter(
      (a) => a.submissions.some((s) => s.status === "graded")
    ).length;
    const pending = total - submitted;

    return [
      {
        label: "Total des travaux",
        value: total,
        helper: "Travaux assignés pour vos sessions.",
        icon: FileText,
        accent: "from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]",
      },
      {
        label: "Travaux remis",
        value: submitted,
        helper: "Devoirs déposés pour correction.",
        icon: CheckCircle2,
        accent: "from-[#003b96] via-[var(--cj-blue)] to-[#0f172a]",
      },
      {
        label: "À faire",
        value: pending,
        helper: "Travaux restants à préparer.",
        icon: Clock,
        accent: "from-[#eab308] via-[#ca8a04] to-[#854d0e]",
      },
      {
        label: "Corrigés",
        value: graded,
        helper: "Travaux évalués et notés.",
        icon: CheckCircle2,
        accent: "from-[#10b981] via-[#059669] to-[#065f46]",
      },
    ];
  }, [assignments]);

  const uploadAssignmentDirect = (formData: FormData, assignmentId: number): Promise<Response> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const pct = Math.round((event.loaded / event.total) * 100);
        setProgressMap((prev) => ({ ...prev, [assignmentId]: pct }));
      };

      xhr.onerror = () => reject(new Error("La connexion a été interrompue pendant le téléversement."));
      xhr.onabort = () => reject(new Error("Le téléversement a été annulé."));
      xhr.onload = () => {
        const headers = new Headers();
        const contentType = xhr.getResponseHeader("content-type");
        if (contentType) headers.set("content-type", contentType);
        resolve(new Response(xhr.responseText, { status: xhr.status, statusText: xhr.statusText, headers }));
      };

      xhr.open("POST", "/api/student/assignments");
      xhr.send(formData);
    });

  const handleInlineSubmit = async (assignment: Assignment) => {
    const assignmentId = assignment.id;
    const files = selectedFilesMap[assignmentId];

    if (!files || files.length === 0) {
      setErrorMap((prev) => ({ ...prev, [assignmentId]: "Veuillez choisir un fichier à téléverser." }));
      return;
    }

    // Validation des fichiers côté client
    const maxMB = assignment.maxFileSize || 10;
    const maxBytes = maxMB * 1024 * 1024;
    const allowedTypes = assignment.allowedFileTypes?.length
      ? assignment.allowedFileTypes.map((t) => t.trim().toLowerCase().replace(/^\./, ""))
      : ["pdf", "doc", "docx", "zip", "rar", "png", "jpg", "jpeg"];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxBytes) {
        setErrorMap((prev) => ({
          ...prev,
          [assignmentId]: `Le fichier "${file.name}" (${(file.size / 1024 / 1024).toFixed(
            1
          )} MB) dépasse la taille maximale autorisée de ${maxMB} MB.`,
        }));
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (allowedTypes.length > 0 && !allowedTypes.includes(ext)) {
        setErrorMap((prev) => ({
          ...prev,
          [assignmentId]: `Format non autorisé pour "${file.name}" (.${ext}). Formats acceptés : ${allowedTypes.join(
            ", "
          )}.`,
        }));
        return;
      }
    }

    setSubmittingMap((prev) => ({ ...prev, [assignmentId]: true }));
    setProgressMap((prev) => ({ ...prev, [assignmentId]: 5 }));
    setErrorMap((prev) => ({ ...prev, [assignmentId]: "" }));
    setSuccessMap((prev) => ({ ...prev, [assignmentId]: "" }));

    try {
      const formData = new FormData();
      formData.append("assignmentId", String(assignmentId));
      formData.append("fileCount", String(files.length));

      for (let i = 0; i < files.length; i++) {
        formData.append(`file_${i}`, files[i]);
      }

      const res = await uploadAssignmentDirect(formData, assignmentId);

      let resData: any = {};
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        resData = await res.json().catch(() => ({}));
      } else {
        const rawText = await res.text().catch(() => "");
        console.error("[Inline Upload Error] Non-JSON response:", rawText);
        if (res.status === 413) {
          resData = {
            error: "Fichier trop volumineux (limite réseau atteinte). Veuillez compresser votre fichier ou choisir un document de moins de 4.5 Mo.",
          };
        } else if (res.status === 401 || res.status === 403) {
          resData = { error: "Votre session a expiré ou vous n'êtes pas inscrit à cette formation. Veuillez vous reconnecter." };
        } else if (res.status === 404) {
          resData = { error: "Le devoir sélectionné est introuvable ou archivé. Veuillez rafraîchir la page." };
        } else {
          resData = { error: `Une erreur serveur est survenue (Code HTTP ${res.status}).` };
        }
      }

      if (!res.ok || resData.success === false) {
        throw new Error(
          resData.message || resData.error || resData.detail || `Échec de la remise (Code HTTP ${res.status}).`
        );
      }

      setProgressMap((prev) => ({ ...prev, [assignmentId]: 100 }));
      setSuccessMap((prev) => ({ ...prev, [assignmentId]: "Votre travail a été téléversé avec succès !" }));
      setSelectedFilesMap((prev) => ({ ...prev, [assignmentId]: null }));
      setReplaceModeMap((prev) => ({ ...prev, [assignmentId]: false }));

      // Rafraîchir les devoirs
      setTimeout(() => {
        fetchAssignments();
      }, 1500);
    } catch (err: any) {
      setErrorMap((prev) => ({
        ...prev,
        [assignmentId]: err.message || "Une erreur est survenue lors du téléversement du travail.",
      }));
      setProgressMap((prev) => ({ ...prev, [assignmentId]: 0 }));
    } finally {
      setSubmittingMap((prev) => ({ ...prev, [assignmentId]: false }));
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    const submission = assignment.submissions[0];
    if (!submission) {
      const isPast = new Date(assignment.deadline) < new Date();
      if (isPast) {
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 rounded-full px-3 py-1 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            En retard
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 rounded-full px-3 py-1 border border-blue-200">
          <Clock className="w-3.5 h-3.5" />
          À faire
        </span>
      );
    }

    switch (submission.status) {
      case "graded":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full px-3 py-1 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Corrigé ({submission.grade}/20)
          </span>
        );
      case "returned":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 rounded-full px-3 py-1 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            À refaire
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-full px-3 py-1 border border-indigo-200">
            <FileCheck className="w-3.5 h-3.5" />
            Travail remis
          </span>
        );
    }
  };

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace étudiant"
        title="Mes travaux & devoirs"
        description="Retrouvez vos TP, projets et examens."
        icon={FileText}
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Chargement de vos devoirs...
        </div>
      </StudentPageShell>
    );
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace étudiant"
      title="Mes travaux & devoirs"
      description="Consultez les sujets, téléchargez les consignes et téléversez vos rendus de travaux directement sans quitter cette page."
      icon={FileText}
      metrics={metrics}
    >
      <div className="space-y-6">
        <StudentSectionCard
          eyebrow="Travaux"
          title="Liste des devoirs et TP"
          description="Téléversez vos fichiers de travail directement sous chaque devoir concerné."
          icon={FileText}
        >
          {assignments.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
              Aucun travail ne vous est assigné pour le moment.
            </div>
          ) : (
            <div className="space-y-6">
              {assignments.map((assignment) => {
                const submission = assignment.submissions[0];
                const isSubmitting = !!submittingMap[assignment.id];
                const progress = progressMap[assignment.id] || 0;
                const error = errorMap[assignment.id];
                const success = successMap[assignment.id];
                const selectedFiles = selectedFilesMap[assignment.id];
                const isReplaceMode = replaceModeMap[assignment.id];
                const canSubmit = !submission || submission.status === "returned" || isReplaceMode;

                return (
                  <div
                    key={assignment.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-sm transition-all hover:shadow-md"
                  >
                    {/* Header Devoir */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-[var(--cj-blue)] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                            {assignment.type === "tp"
                              ? "Travail Pratique"
                              : assignment.type === "exam"
                              ? "Examen"
                              : "Projet"}
                          </span>
                          {assignment.difficulty && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              Niveau : {assignment.difficulty === "debutant" ? "Débutant" : assignment.difficulty === "intermediaire" ? "Intermédiaire" : "Avancé"}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-medium">
                            📚 {assignment.formation.title}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mt-2">
                          {assignment.title}
                        </h3>
                      </div>
                      {getStatusBadge(assignment)}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {assignment.description}
                    </p>

                    {/* Objectifs pédagogiques */}
                    {assignment.objectives && (
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed">
                        <strong className="text-[var(--cj-blue)] font-bold">🎯 Objectifs pédagogiques :</strong>
                        <p className="mt-1 whitespace-pre-line text-slate-650">{assignment.objectives}</p>
                      </div>
                    )}

                    {/* Fichiers de consignes / Sujet Admin */}
                    {assignment.files.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2.5">
                        <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          📄 Sujet et documents consignes fournis :
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {assignment.files.map((file) => (
                            <a
                              key={file.id}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 px-4 py-2.5 text-xs font-bold text-[var(--cj-blue)] transition shadow-sm"
                            >
                              <Download className="w-4 h-4 text-[var(--cj-blue)]" />
                              <span>Télécharger le sujet : {file.originalName}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instructions spécifiques */}
                    {assignment.instructions && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 font-bold">Consignes complémentaires :</strong>
                        <p className="mt-1 whitespace-pre-line text-slate-600">{assignment.instructions}</p>
                      </div>
                    )}

                    {/* Informations Date limite */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Date limite de remise : {new Date(assignment.deadline).toLocaleString("fr-FR")}</span>
                    </div>

                    {/* Zone d'affichage des rendus déjà envoyés */}
                    {submission && !isReplaceMode && (
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                            Votre remise actuelle :
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            Remis le {new Date(submission.submittedAt).toLocaleString("fr-FR")}
                          </span>
                        </div>

                        {submission.files.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {submission.files.map((file) => (
                              <a
                                key={file.id}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                              >
                                <Download className="w-3.5 h-3.5 text-slate-500" />
                                <span>Télécharger mon rendu ({file.originalName})</span>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Remarques & Notes */}
                        {submission.status === "graded" && (
                          <div className="mt-3 pt-3 border-t border-blue-100 bg-white/80 p-3.5 rounded-xl border">
                            <p className="text-xs font-bold text-[var(--cj-blue)]">
                              Note attribuée : {submission.grade}/20
                            </p>
                            {submission.feedback && (
                              <p className="text-xs text-slate-600 mt-1 italic">
                                Feedback du formateur : "{submission.feedback}"
                              </p>
                            )}
                          </div>
                        )}

                        {submission.status === "returned" && submission.feedback && (
                          <div className="mt-3 pt-3 border-t border-amber-200 bg-amber-50 p-3 rounded-xl">
                            <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" /> Demande de correction :
                            </p>
                            <p className="text-xs text-amber-900 mt-1">{submission.feedback}</p>
                          </div>
                        )}

                        {/* Bouton pour activer le mode remplacement */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setReplaceModeMap((prev) => ({ ...prev, [assignment.id]: true }))}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-[var(--cj-blue)] transition shadow-sm"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                            Remplacer mon travail
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Zone de Téléversement Direct sur la Carte */}
                    {canSubmit && (
                      <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-b from-blue-50/40 to-white p-5 md:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-[var(--cj-blue)]" />
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              {submission ? "Remplacer votre fichier de rendu" : "Téléverser votre travail directement"}
                            </h4>
                          </div>
                          {isReplaceMode && (
                            <button
                              type="button"
                              onClick={() => setReplaceModeMap((prev) => ({ ...prev, [assignment.id]: false }))}
                              className="text-xs text-slate-500 hover:text-slate-800 underline"
                            >
                              Annuler le remplacement
                            </button>
                          )}
                        </div>

                        {/* Alertes Erreurs / Succès */}
                        {error && (
                          <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-200 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                            <span>{error}</span>
                          </div>
                        )}
                        {success && (
                          <div className="rounded-xl bg-emerald-50 p-3.5 text-xs font-bold text-emerald-700 border border-emerald-200 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>{success}</span>
                          </div>
                        )}

                        {/* Sélecteur de fichier direct */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-700">
                            Sélectionner le fichier à téléverser *
                          </label>
                          <input
                            type="file"
                            disabled={isSubmitting}
                            onChange={(e) =>
                              setSelectedFilesMap((prev) => ({ ...prev, [assignment.id]: e.target.files }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-sm outline-none transition focus:border-[var(--cj-blue)] focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
                          />
                          <p className="text-[11px] text-slate-500">
                            Taille max autorisée : <strong className="text-slate-700">{assignment.maxFileSize || 10} MB</strong>.
                            Formats acceptés : <strong className="text-slate-700">{assignment.allowedFileTypes?.join(", ") || "pdf, doc, docx, zip"}</strong>.
                          </p>
                        </div>

                        {/* Barre de Progression en Temps Réel */}
                        {isSubmitting && (
                          <div className="space-y-1.5 pt-2">
                            <div className="flex justify-between text-[11px] font-bold text-slate-700">
                              <span className="flex items-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--cj-blue)]" />
                                Téléversement vers Cloudflare R2...
                              </span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 border border-slate-300">
                              <div
                                className="h-full bg-gradient-to-r from-[var(--cj-blue)] to-blue-500 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Bouton de Validation Direct */}
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            disabled={isSubmitting || !selectedFiles || selectedFiles.length === 0}
                            onClick={() => handleInlineSubmit(assignment)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[var(--cj-blue)] px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[var(--cj-blue-700)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span>{isSubmitting ? "Téléversement..." : isReplaceMode ? "Remplacer mon travail" : "Téléverser mon travail"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </StudentSectionCard>
      </div>
    </StudentPageShell>
  );
}
