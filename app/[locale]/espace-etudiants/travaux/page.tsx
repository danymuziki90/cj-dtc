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
  X,
} from "lucide-react";
import {
  StudentPageShell,
  StudentSectionCard,
  StudentMetricCard,
  studentPrimaryButtonClassName,
  studentSecondaryButtonClassName,
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

  // States pour la soumission
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/assignments");
      if (!res.ok) throw new Error("Erreur de chargement des travaux");
      const data = await res.json();
      setAssignments(data || []);
    } catch (err) {
      console.error(err);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !uploadFiles || uploadFiles.length === 0) {
      setErrorMsg("Veuillez choisir un fichier à remettre.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("assignmentId", String(selectedAssignment.id));
      formData.append("fileCount", String(uploadFiles.length));

      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append(`file_${i}`, uploadFiles[i]);
      }

      const res = await fetch("/api/student/assignments", {
        method: "POST",
        body: formData,
      });

      let resData: any = {};
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        resData = await res.json().catch(() => ({}));
      } else {
        const rawText = await res.text().catch(() => "");
        console.error("[Assignment Upload Error] Non-JSON server response:", rawText);
        resData = { error: "Une erreur est survenue lors du dépôt du travail. Veuillez réessayer." };
      }

      if (!res.ok) {
        throw new Error(resData.error || "Le fichier n'a pas pu être envoyé. Veuillez réessayer.");
      }

      setSuccessMsg("Votre travail a été déposé avec succès.");
      setUploadFiles(null);
      
      // Actualiser
      setTimeout(() => {
        setSelectedAssignment(null);
        setSuccessMsg("");
        fetchAssignments();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur est survenue lors du dépôt du travail.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    const submission = assignment.submissions[0];
    if (!submission) {
      const isPast = new Date(assignment.deadline) < new Date();
      if (isPast) {
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 rounded-full px-3 py-1 border border-red-100">
            <AlertTriangle className="w-3.5 h-3.5" />
            En retard
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 rounded-full px-3 py-1 border border-blue-100">
          <Clock className="w-3.5 h-3.5" />
          Nouveau
        </span>
      );
    }

    switch (submission.status) {
      case "graded":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full px-3 py-1 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Corrigé ({submission.grade}/20)
          </span>
        );
      case "returned":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 rounded-full px-3 py-1 border border-amber-100">
            <AlertTriangle className="w-3.5 h-3.5" />
            À refaire
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-full px-3 py-1 border border-indigo-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Remis
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
      description="Consultez les sujets, téléchargez les consignes et déposez vos rendus de travaux pratiques."
      icon={FileText}
      metrics={metrics}
    >
      <div className="space-y-6">
        <StudentSectionCard
          eyebrow="Travaux"
          title="Liste des devoirs et TP"
          description="Accédez aux travaux assignés pour vos sessions de formation active."
          icon={FileText}
        >
          {assignments.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
              Aucun travail ne vous est assigné pour le moment.
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const submission = assignment.submissions[0];
                const isPast = new Date(assignment.deadline) < new Date();
                const canSubmit = !submission || submission.status === "returned";

                return (
                  <div
                    key={assignment.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-4 shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-[var(--cj-blue)] bg-blue-50 px-2.5 py-1 rounded-lg">
                            {assignment.type === "tp"
                              ? "Travail Pratique"
                              : assignment.type === "exam"
                              ? "Examen"
                              : "Projet"}
                          </span>
                          {assignment.difficulty && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              Niveau: {assignment.difficulty === "debutant" ? "Débutant" : assignment.difficulty === "intermediaire" ? "Intermédiaire" : "Avancé"}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {assignment.formation.title}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">
                          {assignment.title}
                        </h3>
                      </div>
                      {getStatusBadge(assignment)}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {assignment.description}
                    </p>

                    {/* Objectifs pédagogiques */}
                    {assignment.objectives && (
                      <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-3.5 text-xs text-slate-700 leading-normal">
                        <strong className="text-[var(--cj-blue)]">🎯 Objectifs pédagogiques :</strong>
                        <p className="mt-1 whitespace-pre-line text-slate-650">{assignment.objectives}</p>
                      </div>
                    )}

                    {/* Fichiers de consignes */}
                    {assignment.files.length > 0 && (
                      <div className="space-y-2">
                        <span className="block text-xs font-bold text-slate-700 uppercase">
                          Fichiers et Consignes :
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {assignment.files.map((file) => (
                            <a
                              key={file.id}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              {file.originalName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instructions spécifiques */}
                    {assignment.instructions && (
                      <div className="bg-slate-55/40 border border-slate-100 rounded-2xl p-4 text-xs text-slate-700 leading-normal">
                        <strong>Consignes complémentaires :</strong>
                        <p className="mt-1 whitespace-pre-line">{assignment.instructions}</p>
                      </div>
                    )}

                    {/* Footer / Remise */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        Date limite : {new Date(assignment.deadline).toLocaleString("fr-FR")}
                      </div>

                      <div className="flex items-center gap-2">
                        {canSubmit ? (
                          <button
                            onClick={() => setSelectedAssignment(assignment)}
                            className={studentPrimaryButtonClassName}
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            {submission ? "Soumettre à nouveau" : "Déposer mon travail"}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 italic">
                            Dépôt verrouillé
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Retour de correction (feedback & grade) */}
                    {submission && (
                      <div className="border-t border-slate-100 pt-4 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase">
                          Détails de la soumission :
                        </h4>
                        
                        <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                          <p className="text-xs text-slate-500">
                            Remis le {new Date(submission.submittedAt).toLocaleString("fr-FR")}
                          </p>

                          {submission.files.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {submission.files.map((file) => (
                                <a
                                  key={file.id}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                                >
                                  <Download className="w-3 h-3" />
                                  {file.originalName}
                                </a>
                              ))}
                            </div>
                          )}

                          {submission.status === "graded" && (
                            <div className="pt-2 border-t border-slate-200/60">
                              <p className="text-xs font-bold text-[var(--cj-blue)]">
                                Note obtenue : {submission.grade}/20
                              </p>
                              {submission.feedback && (
                                <p className="text-xs text-slate-650 mt-1 italic">
                                  Commentaire : "{submission.feedback}"
                                </p>
                              )}
                            </div>
                          )}

                          {submission.status === "returned" && submission.feedback && (
                            <div className="pt-2 border-t border-amber-200/60 bg-amber-50/20 p-2.5 rounded-lg">
                              <p className="text-xs font-bold text-amber-700">
                                Demande de correction :
                              </p>
                              <p className="text-xs text-slate-650 mt-1">
                                "{submission.feedback}"
                              </p>
                            </div>
                          )}
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

      {/* Modal de remise de devoir */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[linear-gradient(120deg,#001737_0%,#002d72_52%,#0c4da2_100%)] px-6 py-5 text-white flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">
                  Déposer mon travail
                </p>
                <h3 className="text-sm font-bold mt-1 line-clamp-1">
                  {selectedAssignment.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                  {errorMsg}
                </p>
              )}
              {successMsg && (
                <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-600 border border-emerald-100">
                  {successMsg}
                </p>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Fichier de rendu *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFiles(e.target.files)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-950 shadow-sm outline-none focus:border-[var(--cj-blue)] focus:ring-4 focus:ring-blue-100"
                />
                <p className="text-[10px] text-slate-400">
                  Taille max autorisée : {selectedAssignment.maxFileSize || 10} MB. <br />
                  Formats autorisés : {selectedAssignment.allowedFileTypes?.join(", ") || "pdf, doc, docx, zip"}.
                </p>
              </div>

              <div className="flex gap-2 pt-2 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--cj-blue)] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--cj-blue-700)] disabled:opacity-60 shadow"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {submitting ? "Téléversement..." : "Envoyer mon devoir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StudentPageShell>
  );
}
