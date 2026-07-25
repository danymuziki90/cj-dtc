"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
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
  Award,
  Sparkles,
  Eye,
  FileSpreadsheet,
  FileArchive,
  FileImage,
  FileCode,
  Lock,
  GraduationCap,
  X,
} from "lucide-react";
import {
  StudentPageShell,
  StudentSectionCard,
} from "@/components/ui/student-space";
import { supabase } from "@/lib/supabase";

interface AssignmentFile {
  id: number;
  name: string;
  originalName: string;
  size: number;
  url: string;
  mimeType: string;
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
  status: 'submitted' | 'graded' | 'returned' | string;
  grade: number | null;
  feedback: string | null;
  submittedAt: string;
  gradedAt: string | null;
  files: SubmissionFile[];
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  objectives: string | null;
  instructions: string | null;
  type: "tp" | "exam" | "project" | "homework";
  difficulty?: "debutant" | "intermediaire" | "avance";
  publishedAt: string;
  createdAt: string;
  deadline: string;
  maxFileSize: number;
  maxFiles: number;
  allowResubmission: boolean;
  allowedFileTypes: string[];
  formation: {
    title: string;
  };
  session?: {
    id: number;
    startDate: string;
    endDate: string;
    format: string;
  };
  files: AssignmentFile[];
  submissions: Submission[];
}

export default function StudentAssignmentsPage() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "fr";
  const router = useRouter();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  // Modal de prévisualisation de fichier
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");

  // Local state per assignment card (indexed by assignmentId)
  const [selectedFilesMap, setSelectedFilesMap] = useState<Record<number, FileList | null>>({});
  const [submittingMap, setSubmittingMap] = useState<Record<number, boolean>>({});
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const [errorMap, setErrorMap] = useState<Record<number, string>>({});
  const [successMap, setSuccessMap] = useState<Record<number, string>>({});
  const [replaceModeMap, setReplaceModeMap] = useState<Record<number, boolean>>({});

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setAccessError(null);
      const res = await fetch("/api/student/assignments");

      if (res.status === 401) {
        setAccessError("Votre session a expiré. Veuillez vous reconnecter à l'espace étudiant.");
        return;
      }

      if (res.status === 403) {
        setAccessError("Accès restreint. Seuls les étudiants inscrits et dont l'inscription est validée peuvent accéder à cette section.");
        return;
      }

      if (!res.ok) throw new Error("Impossible de charger vos devoirs.");
      const data = await res.json();
      setAssignments(data || []);
    } catch (err: any) {
      console.error("Fetch student assignments error:", err);
      setAccessError(err.message || "Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();

    if (!supabase) return;

    // Realtime Supabase Broadcast Listening
    const channel = supabase
      .channel("student_travaux_realtime")
      .on("broadcast", { event: "submission_graded" }, () => {
        fetchAssignments();
      })
      .on("broadcast", { event: "assignment_created" }, () => {
        fetchAssignments();
      })
      .on("broadcast", { event: "assignment_updated" }, () => {
        fetchAssignments();
      })
      .on("broadcast", { event: "assignment_deleted" }, () => {
        fetchAssignments();
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [fetchAssignments]);

  // Compute Time Remaining Countdown String
  const getTimeRemaining = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr).getTime();
    const now = Date.now();
    const diff = deadline - now;

    if (diff <= 0) {
      return { text: "Échéance dépassée", isPast: true, urgent: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 2) {
      return { text: `Reste ${days} jours`, isPast: false, urgent: false };
    }
    if (days >= 1) {
      return { text: `Reste ${days}j et ${hours}h`, isPast: false, urgent: false };
    }
    if (hours >= 1) {
      return { text: `Reste ${hours}h ${minutes}m (Aujourd'hui)`, isPast: false, urgent: true };
    }
    return { text: `Reste ${minutes} minutes !`, isPast: false, urgent: true };
  };

  // KPIs Metrics
  const metrics = useMemo(() => {
    const total = assignments.length;
    const submitted = assignments.filter((a) => a.submissions.length > 0).length;
    const gradedAssignments = assignments.filter((a) =>
      a.submissions.some((s) => s.status === "graded")
    );
    const gradedCount = gradedAssignments.length;
    const pending = total - submitted;

    // Average grade calculation
    let avgGrade = 0;
    const gradesList = assignments
      .flatMap((a) => a.submissions)
      .filter((s) => s.status === "graded" && s.grade !== null && s.grade !== undefined)
      .map((s) => s.grade as number);

    if (gradesList.length > 0) {
      avgGrade = Number((gradesList.reduce((acc, g) => acc + g, 0) / gradesList.length).toFixed(1));
    }

    return [
      {
        label: "Total des travaux",
        value: total,
        helper: "Devoirs assignés à votre session.",
        icon: FileText,
        accent: "from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]",
      },
      {
        label: "Travaux remis",
        value: submitted,
        helper: "Fichiers déposés en attente.",
        icon: CheckCircle2,
        accent: "from-[#003b96] via-[var(--cj-blue)] to-[#0f172a]",
      },
      {
        label: "À réaliser",
        value: pending,
        helper: "Travaux à préparer avant échéance.",
        icon: Clock,
        accent: "from-[#eab308] via-[#ca8a04] to-[#854d0e]",
      },
      {
        label: gradedCount > 0 ? `Corrigés (Moy: ${avgGrade}/20)` : "Corrigés",
        value: gradedCount,
        helper: "Travaux notés avec remarques.",
        icon: Award,
        accent: "from-[#10b981] via-[#059669] to-[#065f46]",
      },
    ];
  }, [assignments]);

  // File Upload XHR Promise with Progress
  const uploadAssignmentDirect = (formData: FormData, assignmentId: number): Promise<Response> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const pct = Math.round((event.loaded / event.total) * 100);
        setProgressMap((prev) => ({ ...prev, [assignmentId]: pct }));
      };

      xhr.onerror = () => reject(new Error("La connexion réseau a été interrompue pendant l'envoi vers Cloudflare R2."));
      xhr.onabort = () => reject(new Error("Téléversement annulé par l'utilisateur."));
      xhr.onload = () => {
        const headers = new Headers();
        const contentType = xhr.getResponseHeader("content-type");
        if (contentType) headers.set("content-type", contentType);
        resolve(new Response(xhr.responseText, { status: xhr.status, statusText: xhr.statusText, headers }));
      };

      xhr.open("POST", "/api/student/assignments");
      xhr.send(formData);
    });

  // Handle Direct Upload
  const handleInlineSubmit = async (assignment: Assignment) => {
    const assignmentId = assignment.id;
    const files = selectedFilesMap[assignmentId];

    if (!files || files.length === 0) {
      setErrorMap((prev) => ({ ...prev, [assignmentId]: "Veuillez d'abord choisir au moins un fichier." }));
      return;
    }

    const maxAllowedFiles = assignment.maxFiles || 5;
    if (files.length > maxAllowedFiles) {
      setErrorMap((prev) => ({
        ...prev,
        [assignmentId]: `Vous ne pouvez pas sélectionner plus de ${maxAllowedFiles} fichier(s) pour ce devoir.`,
      }));
      return;
    }

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
          )} MB) dépasse la limite de ${maxMB} MB.`,
        }));
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (allowedTypes.length > 0 && !allowedTypes.includes(ext)) {
        setErrorMap((prev) => ({
          ...prev,
          [assignmentId]: `Format non autorisé pour "${file.name}" (.${ext}). Acceptés : ${allowedTypes.join(", ")}.`,
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
        if (res.status === 413) {
          resData = { error: "Fichier trop volumineux pour le réseau." };
        } else {
          resData = { error: `Une erreur est survenue (Code ${res.status}).` };
        }
      }

      if (!res.ok || resData.success === false) {
        throw new Error(resData.error || resData.message || "Échec de la remise.");
      }

      setProgressMap((prev) => ({ ...prev, [assignmentId]: 100 }));
      setSuccessMap((prev) => ({ ...prev, [assignmentId]: "Votre travail a été téléversé sur Cloudflare R2 avec succès !" }));
      setSelectedFilesMap((prev) => ({ ...prev, [assignmentId]: null }));
      setReplaceModeMap((prev) => ({ ...prev, [assignmentId]: false }));

      setTimeout(() => {
        fetchAssignments();
      }, 1200);
    } catch (err: any) {
      setErrorMap((prev) => ({
        ...prev,
        [assignmentId]: err.message || "Une erreur est survenue lors du téléversement.",
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
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-full px-3 py-1 border border-emerald-200 shadow-sm">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            Corrigé ({submission.grade}/20)
          </span>
        );
      case "returned":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 rounded-full px-3 py-1 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            À refaire
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-800 bg-indigo-50 rounded-full px-3 py-1 border border-indigo-200">
            <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
            Travail déposé
          </span>
        );
    }
  };

  const getFileIcon = (mimeType?: string, fileName?: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    if (mimeType?.includes('pdf') || ext === 'pdf') return <FileText className="w-4 h-4 text-red-500 shrink-0" />;
    if (ext === 'doc' || ext === 'docx') return <FileText className="w-4 h-4 text-blue-600 shrink-0" />;
    if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (ext === 'zip' || ext === 'rar' || ext === '7z') return <FileArchive className="w-4 h-4 text-amber-600 shrink-0" />;
    if (mimeType?.includes('image') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return <FileImage className="w-4 h-4 text-purple-600 shrink-0" />;
    return <FileCode className="w-4 h-4 text-slate-500 shrink-0" />;
  };

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace étudiant"
        title="Mes travaux & devoirs"
        description="Chargement de votre espace de travaux..."
        icon={FileText}
      >
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--cj-blue)]" />
          <span className="text-xs font-semibold uppercase tracking-wider">Chargement de vos travaux en cours...</span>
        </div>
      </StudentPageShell>
    );
  }

  if (accessError) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace étudiant"
        title="Accès aux travaux"
        description="Vérification des droits d'accès à la session."
        icon={Lock}
      >
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Accès restreint aux travaux</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{accessError}</p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/espace-etudiants`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--cj-blue)] text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Retour à mon tableau de bord
            </button>
          </div>
        </div>
      </StudentPageShell>
    );
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace étudiant"
      title="Mes travaux & devoirs"
      description="Consultez les sujets publiés, téléchargez les consignes depuis Cloudflare R2 et téléversez vos rendus en direct."
      icon={FileText}
      metrics={metrics}
    >
      <div className="space-y-6">
        <StudentSectionCard
          eyebrow="Travaux & Évaluations"
          title="Liste des devoirs et TP de votre session"
          description="Téléversez vos fichiers directement sous chaque devoir concerné."
          icon={FileText}
        >
          {assignments.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-white text-slate-300 flex items-center justify-center mx-auto border border-slate-200">
                <FileText className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800">Aucun travail publié pour le moment</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Vos devoirs et TP apparaîtront automatiquement dès qu'ils seront publiés par l'administration.
              </p>
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
                const canSubmit = !submission || submission.status === "returned" || (isReplaceMode && assignment.allowResubmission);
                const timeInfo = getTimeRemaining(assignment.deadline);

                return (
                  <div
                    key={assignment.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-sm transition-all hover:shadow-md"
                  >
                    {/* Header Devoir */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[var(--cj-blue)] bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                            {assignment.type === "tp"
                              ? "Travail Pratique"
                              : assignment.type === "exam"
                              ? "Examen"
                              : assignment.type === "project"
                              ? "Projet"
                              : "Devoir"}
                          </span>
                          {assignment.difficulty && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {assignment.difficulty === "debutant" ? "Débutant" : assignment.difficulty === "intermediaire" ? "Intermédiaire" : "Avancé"}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 font-bold">
                            📚 {assignment.formation?.title || "Formation"}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">
                          {assignment.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Countdown Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                            timeInfo.isPast
                              ? "bg-red-50 text-red-700 border-red-200"
                              : timeInfo.urgent
                              ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {timeInfo.text}
                        </span>
                        {getStatusBadge(assignment)}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {assignment.description}
                    </p>

                    {/* Objectifs pédagogiques */}
                    {assignment.objectives && (
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed">
                        <strong className="text-[var(--cj-blue)] font-bold block mb-1">🎯 Objectifs pédagogiques :</strong>
                        <p className="whitespace-pre-line text-slate-650">{assignment.objectives}</p>
                      </div>
                    )}

                    {/* Documents joints par l'Admin (Sujet R2) */}
                    {assignment.files.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                        <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          📄 Sujet et documents consignes fournis :
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {assignment.files.map((file) => (
                            <div key={file.id} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm">
                              {getFileIcon(file.mimeType, file.originalName)}
                              <span className="max-w-[200px] truncate" title={file.originalName}>{file.originalName}</span>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 inline-flex items-center gap-1 text-[var(--cj-blue)] hover:underline"
                              >
                                <Download className="w-3.5 h-3.5" /> Télécharger
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instructions complémentaires */}
                    {assignment.instructions && (
                      <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 font-bold block mb-1">Consignes de remise :</strong>
                        <p className="whitespace-pre-line text-slate-600">{assignment.instructions}</p>
                      </div>
                    )}

                    {/* Informations dates */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Publié le : {new Date(assignment.publishedAt || assignment.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Date limite : {new Date(assignment.deadline).toLocaleString("fr-FR")}
                      </span>
                    </div>

                    {/* Zone de rendu existant */}
                    {submission && !isReplaceMode && (
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-3">
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
                                {getFileIcon(file.mimeType, file.originalName)}
                                <span>{file.originalName}</span>
                                <Download className="w-3.5 h-3.5 text-slate-400" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Remarques & Notes Administrateur */}
                        {submission.status === "graded" && (
                          <div className="mt-3 border-t border-blue-100 bg-white p-4 rounded-xl border space-y-1">
                            <p className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-emerald-600" />
                              Note finale attribuée : {submission.grade}/20
                            </p>
                            {submission.feedback && (
                              <p className="text-xs text-slate-650 italic pt-1">
                                Commentaire du formateur : "{submission.feedback}"
                              </p>
                            )}
                          </div>
                        )}

                        {submission.status === "returned" && submission.feedback && (
                          <div className="mt-3 border-t border-amber-200 bg-amber-50 p-3 rounded-xl">
                            <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" /> Demande de modification :
                            </p>
                            <p className="text-xs text-amber-900 mt-1">{submission.feedback}</p>
                          </div>
                        )}

                        {/* Bouton pour activer le mode remplacement */}
                        {assignment.allowResubmission !== false && (
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
                        )}
                      </div>
                    )}

                    {/* Zone de Dépôt Direct */}
                    {canSubmit && (
                      <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-b from-blue-50/40 to-white p-5 md:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-[var(--cj-blue)]" />
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              {submission ? "Remplacer votre rendu" : "Déposer votre travail directement"}
                            </h4>
                          </div>
                          {isReplaceMode && (
                            <button
                              type="button"
                              onClick={() => setReplaceModeMap((prev) => ({ ...prev, [assignment.id]: false }))}
                              className="text-xs text-slate-500 hover:text-slate-800 underline"
                            >
                              Annuler
                            </button>
                          )}
                        </div>

                        {/* Messages d'erreur et de succès */}
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

                        {/* Sélecteur de fichiers */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-700">
                            Sélectionner le ou les fichiers à téléverser *
                          </label>
                          <input
                            type="file"
                            multiple
                            disabled={isSubmitting}
                            onChange={(e) =>
                              setSelectedFilesMap((prev) => ({ ...prev, [assignment.id]: e.target.files }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-sm outline-none transition focus:border-[var(--cj-blue)] focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
                          />
                          <p className="text-[11px] text-slate-500">
                            Taille max autorisée : <strong className="text-slate-700">{assignment.maxFileSize || 10} MB</strong>.
                            Max fichiers : <strong className="text-slate-700">{assignment.maxFiles || 5}</strong>.
                            Formats acceptés : <strong className="text-slate-700">{assignment.allowedFileTypes?.join(", ") || "pdf, doc, docx, zip"}</strong>.
                          </p>
                        </div>

                        {/* Barre de progression temps réel */}
                        {isSubmitting && (
                          <div className="space-y-1.5 pt-2">
                            <div className="flex justify-between text-[11px] font-bold text-slate-700">
                              <span className="flex items-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--cj-blue)]" />
                                Envoi sécurisé vers Cloudflare R2...
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

                        {/* Bouton de téléversement */}
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
                            <span>
                              {isSubmitting
                                ? "Téléversement..."
                                : isReplaceMode
                                ? "Remplacer mon travail"
                                : "Téléverser mon travail"}
                            </span>
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

      {/* Modal Prévisualisation Fichier */}
      {previewFileUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full h-[80vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <span className="text-xs font-bold text-slate-800 truncate">{previewFileName}</span>
              <button
                type="button"
                onClick={() => setPreviewFileUrl(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 p-2">
              <iframe src={previewFileUrl} className="w-full h-full rounded-2xl border-0" title="Aperçu document" />
            </div>
          </div>
        </div>
      )}
    </StudentPageShell>
  );
}
