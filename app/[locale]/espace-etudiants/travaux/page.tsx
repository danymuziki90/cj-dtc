"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileCode2,
  FileText,
  Filter,
  FolderOpen,
  GraduationCap,
  Info,
  Loader2,
  Search,
  UploadCloud,
} from "lucide-react";
import { FormattedDate } from "@/components/FormattedDate";
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentMutedButtonClassName,
  studentPrimaryButtonClassName,
  type StudentMetric,
} from "@/components/ui/student-space";
import { AssignmentSubmitModal } from "../_components/AssignmentSubmitModal";
import { getAssignmentStatus } from "../_components/utils";

interface AssignmentFileItem {
  id: number;
  name?: string;
  originalName?: string;
  fileName?: string;
  size?: number;
  mimeType?: string;
  url?: string;
  fileUrl?: string;
}

interface AssignmentSubmissionItem {
  id: number;
  status: string;
  submittedAt?: string;
  createdAt?: string;
  gradedAt?: string | null;
  grade?: number | null;
  feedback?: string | null;
  files?: AssignmentFileItem[];
}

interface Assignment {
  id: number;
  title: string;
  type: string;
  description: string;
  objectives?: string | null;
  instructions?: string | null;
  difficulty?: string | null;
  deadline: string;
  createdAt?: string;
  publishedAt?: string;
  maxFileSize?: number;
  maxFiles?: number;
  allowResubmission?: boolean;
  allowedFileTypes?: string[];
  formationId?: number;
  formation?: {
    id: number;
    title: string;
    slug?: string;
  };
  session?: {
    id: number;
    startDate: string;
    endDate: string;
    location?: string | null;
    format?: string;
  };
  files?: AssignmentFileItem[];
  submissions?: AssignmentSubmissionItem[];
}

function TravauxContent() {
  const params = useParams<{ locale?: string }>();
  const searchParams = useSearchParams();
  const locale = params?.locale || "fr";

  const initialFilter = searchParams.get("filter") || "all";
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal submission state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    const queryFilter = searchParams.get("filter");
    if (queryFilter) {
      setFilter(queryFilter);
    }
  }, [searchParams]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/student/assignments", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des travaux");
      }
      const data = await response.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des travaux:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedAssignment || !uploadFiles || uploadFiles.length === 0) {
      setUploadErrorMessage("Veuillez choisir au moins un fichier à remettre.");
      return;
    }

    setIsSubmittingWork(true);
    setUploadErrorMessage("");
    setUploadSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("assignmentId", String(selectedAssignment.id));
      formData.append("fileCount", String(uploadFiles.length));

      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append(`file_${i}`, uploadFiles[i]);
      }

      const response = await fetch("/api/student/assignments", {
        method: "POST",
        body: formData,
      });

      let resData: any = {};
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        resData = await response.json().catch(() => ({}));
      } else {
        const rawText = await response.text().catch(() => "");
        if (response.status === 413) {
          resData = { error: "Le fichier sélectionné est trop volumineux." };
        } else {
          resData = { error: `Erreur serveur (code HTTP ${response.status}).` };
        }
      }

      if (!response.ok || resData.success === false) {
        throw new Error(resData.message || resData.error || "Échec de l'envoi.");
      }

      setUploadSuccessMessage("Votre travail a été déposé avec succès !");
      setUploadFiles(null);
      await fetchAssignments();

      setTimeout(() => {
        setSelectedAssignment(null);
        setUploadSuccessMessage("");
      }, 1500);
    } catch (err: any) {
      setUploadErrorMessage(err.message || "Erreur lors du dépôt de fichier.");
    } finally {
      setIsSubmittingWork(false);
    }
  };

  const pendingCount = useMemo(() => {
    return assignments.filter((item) => {
      const hasSub = item.submissions && item.submissions.length > 0;
      const isFuture = new Date(item.deadline).getTime() >= Date.now();
      return !hasSub && isFuture;
    }).length;
  }, [assignments]);

  const submittedCount = useMemo(() => {
    return assignments.filter((item) => item.submissions && item.submissions.length > 0).length;
  }, [assignments]);

  const evaluatedCount = useMemo(() => {
    return assignments.filter((item) =>
      item.submissions?.some((sub) => sub.status === "graded" || sub.grade != null)
    ).length;
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const hasSub = item.submissions && item.submissions.length > 0;
      const isEvaluated = item.submissions?.some(
        (sub) => sub.status === "graded" || sub.grade != null
      );

      if (filter === "pending" && (hasSub || new Date(item.deadline).getTime() < Date.now())) return false;
      if (filter === "submitted" && !hasSub) return false;
      if (filter === "evaluated" && !isEvaluated) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchFormation = item.formation?.title?.toLowerCase().includes(q);
        const matchType = item.type?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchFormation && !matchType) return false;
      }

      return true;
    });
  }, [assignments, filter, searchQuery]);

  const metrics = useMemo<StudentMetric[]>(() => {
    return [
      {
        label: "À remettre",
        value: pendingCount,
        helper: "Devoirs en cours à soumettre avant l'échéance.",
        icon: Clock,
        accent: "from-red-600 via-[var(--cj-red)] to-rose-900",
      },
      {
        label: "Travaux rendus",
        value: submittedCount,
        helper: "Devoirs et TP transmis à l'équipe pédagogique.",
        icon: CheckCircle2,
        accent: "from-emerald-600 via-teal-600 to-slate-900",
      },
      {
        label: "Évalués & Notés",
        value: evaluatedCount,
        helper: "Travaux corrigés avec notes et retours.",
        icon: FileCheck2,
        accent: "from-blue-600 via-[var(--cj-blue)] to-slate-950",
      },
    ];
  }, [pendingCount, submittedCount, evaluatedCount]);

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace étudiant"
        title="Mes travaux & évaluations"
        description="Chargement de vos travaux pratiques, projets et examens en cours."
        icon={FileText}
      >
        <StudentSectionCard
          eyebrow="Travaux"
          title="Chargement de vos devoirs"
          description="Veuillez patienter pendant la préparation de vos sujets et remises."
          icon={FolderOpen}
        >
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--cj-blue)]" />
            <span>Chargement de vos travaux...</span>
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    );
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace étudiant"
      title="Mes travaux & évaluations"
      description="Consultez les TP, projets et examens publiés par l'équipe pédagogique, déposez vos rendus et découvrez vos notes."
      icon={FileText}
      metrics={metrics}
      actions={
        <Link
          href={`/${locale}/espace-etudiants`}
          className={studentMutedButtonClassName}
        >
          Retour au tableau de bord
        </Link>
      }
    >
      <StudentSectionCard
        eyebrow="Portail Devoirs"
        title="Gestion centralisée des travaux"
        description="Filtrer vos devoirs par état de rendu, effectuez vos recherches et déposez vos fichiers directement en ligne."
        icon={FolderOpen}
      >
        {/* Controls Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-5 mb-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === "all"
                  ? "bg-white text-[var(--cj-blue)] shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tous les travaux ({assignments.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === "pending"
                  ? "bg-red-500 text-white shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              À remettre ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("submitted")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === "submitted"
                  ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Rendus ({submittedCount})
            </button>
            <button
              onClick={() => setFilter("evaluated")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === "evaluated"
                  ? "bg-[var(--cj-blue)] text-white shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Évalués ({evaluatedCount})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un travail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <StudentEmptyState
            title="Aucun travail trouvé"
            description={
              filter !== "all" || searchQuery
                ? "Aucun devoir ne correspond à vos critères de recherche ou de filtre actuels."
                : "Vous n'avez actuellement aucun devoir attribué dans vos sessions actives. Vos futurs travaux apparaîtront automatiquement ici dès leur publication depuis l'administration."
            }
            action={
              filter !== "all" || searchQuery ? (
                <button
                  onClick={() => {
                    setFilter("all");
                    setSearchQuery("");
                  }}
                  className={studentPrimaryButtonClassName}
                >
                  Réinitialiser les filtres
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredAssignments.map((assign) => {
              const statusInfo = getAssignmentStatus(assign);
              const StatusIcon = statusInfo.icon;
              const submission = assign.submissions?.[0];
              const isGraded = submission?.status === "graded" || submission?.grade != null;
              const isPastDeadline = new Date(assign.deadline).getTime() < Date.now();

              return (
                <div
                  key={assign.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_16px_40px_-20px_rgba(0,45,114,0.25)]"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-block rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--cj-blue)]">
                            {assign.type?.toUpperCase() || "TP"}
                          </span>
                          {assign.difficulty && (
                            <span className="inline-block rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-slate-600">
                              {assign.difficulty}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[var(--cj-blue)] transition">
                          {assign.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500">
                          {assign.formation?.title || "Formation CJ DTC"}
                          {assign.session && (
                            <span className="text-slate-400 font-normal">
                              {" "}• Session du <FormattedDate date={assign.session.startDate} />
                            </span>
                          )}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 ${statusInfo.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {assign.description}
                    </p>

                    {/* Consignes / Instructions Admin */}
                    {assign.instructions && (
                      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                          <Info className="h-3.5 w-3.5 text-amber-600" />
                          <span>Consignes de l'enseignant :</span>
                        </div>
                        <p className="text-amber-800 text-[11px] leading-relaxed">
                          {assign.instructions}
                        </p>
                      </div>
                    )}

                    {/* Fichiers sujets transmis par l'administrateur */}
                    {assign.files && assign.files.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-100">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Sujet & Documents de cours ({assign.files.length}) :
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {assign.files.map((file) => {
                            const fileUrl = file.url || file.fileUrl || "#";
                            const fileName = file.originalName || file.name || file.fileName || "Document_cours";
                            return (
                              <a
                                key={file.id}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/60 px-2.5 py-1 text-[11px] font-semibold text-[var(--cj-blue)] hover:bg-blue-100 transition shadow-xs"
                              >
                                <Download className="h-3.5 w-3.5 text-blue-600" />
                                <span className="truncate max-w-[180px]">{fileName}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Feedback / Grade card if evaluated */}
                    {isGraded && submission && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-emerald-900">
                          <span>Note attribuée :</span>
                          <span className="text-sm font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg">
                            {submission.grade} / 20
                          </span>
                        </div>
                        {submission.feedback && (
                          <p className="text-emerald-800 text-[11px] leading-relaxed pt-1 border-t border-emerald-200/60">
                            <strong>Commentaire du formateur :</strong> {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Fichiers remis par l'étudiant */}
                    {submission?.files && submission.files.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            Votre remise ({submission.files.length}) :
                          </p>
                          {submission.submittedAt && (
                            <span className="text-[10px] text-slate-400">
                              Déposé le <FormattedDate date={submission.submittedAt} />
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {submission.files.map((file) => {
                            const fileUrl = file.url || file.fileUrl || "#";
                            const fileName = file.originalName || file.name || file.fileName || "Rendu_etudiant";
                            return (
                              <a
                                key={file.id}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-700 transition"
                              >
                                <FileCode2 className="h-3.5 w-3.5 text-blue-600" />
                                <span className="truncate max-w-[160px]">{fileName}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>
                        Date limite : <FormattedDate date={assign.deadline} />
                      </span>
                    </div>

                    {(!submission || assign.allowResubmission !== false) && (
                      <button
                        onClick={() => setSelectedAssignment(assign)}
                        className={submission ? studentMutedButtonClassName : studentPrimaryButtonClassName}
                      >
                        <UploadCloud className="h-4 w-4" />
                        <span>{submission ? "Modifier mon dépôt" : "Déposer mon travail"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </StudentSectionCard>

      {/* Upload Submission Modal */}
      <AssignmentSubmitModal
        selectedAssignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onSubmit={handleAssignmentSubmit}
        uploadErrorMessage={uploadErrorMessage}
        uploadSuccessMessage={uploadSuccessMessage}
        setUploadFiles={setUploadFiles}
        isSubmittingWork={isSubmittingWork}
      />
    </StudentPageShell>
  );
}

export default function TravauxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      }
    >
      <TravauxContent />
    </Suspense>
  );
}
