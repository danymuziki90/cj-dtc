"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpDown,
  BookOpen,
  Calendar,
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
  Layers,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  UploadCloud,
  UserCheck,
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
import { AssignmentSubmitModal, type UploadedFileData } from "../_components/AssignmentSubmitModal";
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
  gradedBy?: string | null;
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
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>("all");
  const [sortByDeadline, setSortByDeadline] = useState<"asc" | "desc">("asc");

  // Modal submission state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");

  useEffect(() => {
    fetchAssignments();

    if (!supabase) return;

    const assignmentsChannel = supabase.channel("assignments_channel")
      .on("broadcast", { event: "assignment_created" }, () => {
        fetchAssignments(false);
      })
      .on("broadcast", { event: "assignment_updated" }, () => {
        fetchAssignments(false);
      })
      .on("broadcast", { event: "assignment_deleted" }, () => {
        fetchAssignments(false);
      });

    const submissionsChannel = supabase.channel("submissions_channel")
      .on("broadcast", { event: "submission_created" }, () => {
        fetchAssignments(false);
      })
      .on("broadcast", { event: "submission_graded" }, () => {
        fetchAssignments(false);
      });

    assignmentsChannel.subscribe();
    submissionsChannel.subscribe();

    return () => {
      supabase?.removeChannel(assignmentsChannel);
      supabase?.removeChannel(submissionsChannel);
    };
  }, []);

  useEffect(() => {
    const queryFilter = searchParams.get("filter");
    if (queryFilter) {
      setFilter(queryFilter);
    }
  }, [searchParams]);

  const fetchAssignments = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const response = await fetch(`/api/student/assignments?t=${Date.now()}`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : data.assignments || [];
        setAssignments(list);
      } else {
        const dashRes = await fetch(`/api/student/system/dashboard?t=${Date.now()}`, { cache: "no-store" });
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setAssignments(dashData.dashboard?.assignments || []);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des travaux:", error);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (uploadedFiles: UploadedFileData[]) => {
    if (!selectedAssignment || !uploadedFiles || uploadedFiles.length === 0) {
      setUploadErrorMessage("Veuillez téléverser au moins un fichier avant d'envoyer votre travail.");
      return;
    }

    setIsSubmittingWork(true);
    setUploadErrorMessage("");
    setUploadSuccessMessage("");

    try {
      const response = await fetch("/api/student/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          files: uploadedFiles,
        }),
      });

      let resData: any = {};
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        resData = await response.json().catch(() => ({}));
      } else {
        resData = { error: `Erreur serveur (code HTTP ${response.status}).` };
      }

      if (!response.ok || resData.success === false) {
        throw new Error(resData.message || resData.error || "Échec de l'envoi du travail.");
      }

      setUploadSuccessMessage("Votre travail a été déposé avec succès !");
      await fetchAssignments();

      setTimeout(() => {
        setSelectedAssignment(null);
        setUploadSuccessMessage("");
      }, 1500);
    } catch (err: any) {
      setUploadErrorMessage(err.message || "Erreur lors de l'enregistrement du dépôt.");
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // Dynamic Session Filter Options
  const sessionOptions = useMemo(() => {
    const map = new Map<number, string>();
    assignments.forEach((a) => {
      if (a.session) {
        const d = a.session.startDate ? new Date(a.session.startDate).toLocaleDateString("fr-FR") : "";
        const title = a.formation?.title ? `${a.formation.title} (${d})` : `Session du ${d}`;
        map.set(a.session.id, title);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id: String(id), label }));
  }, [assignments]);

  const pendingCount = useMemo(() => {
    return assignments.filter((item) => {
      const sub = item.submissions?.[0];
      const isReturned = sub?.status === "returned";
      const hasSub = item.submissions && item.submissions.length > 0;
      const isFuture = new Date(item.deadline).getTime() >= Date.now();
      return (!hasSub && isFuture) || isReturned;
    }).length;
  }, [assignments]);

  const submittedCount = useMemo(() => {
    return assignments.filter((item) => {
      const hasSub = item.submissions && item.submissions.length > 0;
      if (!hasSub) return false;
      const isEvaluated = item.submissions?.some(
        (sub) => sub.status === "graded" || sub.status === "returned" || sub.grade != null
      );
      return !isEvaluated;
    }).length;
  }, [assignments]);

  const evaluatedCount = useMemo(() => {
    return assignments.filter((item) =>
      item.submissions?.some(
        (sub) => sub.status === "graded" || sub.status === "returned" || sub.grade != null
      )
    ).length;
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((item) => {
        const sub = item.submissions?.[0];
        const isReturned = sub?.status === "returned";
        const hasSub = item.submissions && item.submissions.length > 0;
        const isEvaluated = item.submissions?.some(
          (sub) => sub.status === "graded" || sub.status === "returned" || sub.grade != null
        );

        if (filter === "pending") {
          const isFuture = new Date(item.deadline).getTime() >= Date.now();
          if ((hasSub && !isReturned) || (!isReturned && !isFuture)) return false;
        }
        if (filter === "submitted" && (!hasSub || isEvaluated)) return false;
        if (filter === "evaluated" && !isEvaluated) return false;

        if (selectedSessionFilter !== "all") {
          if (String(item.session?.id) !== selectedSessionFilter) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = item.title?.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchFormation = item.formation?.title?.toLowerCase().includes(q);
          const matchType = item.type?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchFormation && !matchType) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.deadline).getTime();
        const timeB = new Date(b.deadline).getTime();
        return sortByDeadline === "asc" ? timeA - timeB : timeB - timeA;
      });
  }, [assignments, filter, searchQuery, selectedSessionFilter, sortByDeadline]);

  const metrics = useMemo<StudentMetric[]>(() => {
    return [
      {
        label: "À remettre",
        value: pendingCount,
        helper: "Devoirs en cours à soumettre ou à réviser.",
        icon: Clock,
        accent: "from-red-600 via-[var(--cj-red)] to-rose-900",
      },
      {
        label: "Travaux rendus",
        value: submittedCount,
        helper: "Devoirs transmis en attente de correction.",
        icon: CheckCircle2,
        accent: "from-emerald-600 via-teal-600 to-slate-900",
      },
      {
        label: "Évalués & Notés",
        value: evaluatedCount,
        helper: "Travaux corrigés avec notes /20 et retours.",
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
        title="Mes Travaux & Évaluations"
        description="Chargement de vos travaux pratiques, projets et examens en cours."
        icon={FileText}
      >
        <StudentSectionCard
          eyebrow="Travaux"
          title="Chargement de vos devoirs"
          description="Veuillez patienter pendant la préparation de vos sujets et remises."
          icon={FolderOpen}
        >
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--cj-blue)]" />
            <span className="font-semibold text-slate-700">Préparation de vos sujets et évaluations...</span>
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    );
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace étudiant"
      title="Mes Travaux"
      description="Consultez les TP, projets et examens publiés par vos enseignants, déposez vos travaux en ligne et suivez vos corrections en temps réel."
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
        description="Filtrez par statut, recherchez par mot-clé, triez par date limite et téléversez vos fichiers directement."
        icon={FolderOpen}
      >
        {/* Controls & Filter Bar */}
        <div className="space-y-4 border-b border-slate-200/80 pb-6 mb-8">
          {/* Row 1: Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                filter === "all"
                  ? "bg-white text-[var(--cj-blue)] shadow-md font-extrabold scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              Tous les travaux ({assignments.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                filter === "pending"
                  ? "bg-gradient-to-r from-red-600 to-[var(--cj-red)] text-white shadow-md font-extrabold scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              À remettre ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("submitted")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                filter === "submitted"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-extrabold scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              Travaux rendus ({submittedCount})
            </button>
            <button
              onClick={() => setFilter("evaluated")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                filter === "evaluated"
                  ? "bg-gradient-to-r from-[var(--cj-blue)] to-blue-700 text-white shadow-md font-extrabold scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              Évalués & Notés ({evaluatedCount})
            </button>
          </div>

          {/* Row 2: Search, Session Filter & Sort */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par titre ou mot-clé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
              />
            </div>

            {/* Session Filter */}
            {sessionOptions.length > 0 && (
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  value={selectedSessionFilter}
                  onChange={(e) => setSelectedSessionFilter(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-10 pr-8 py-2.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs cursor-pointer"
                >
                  <option value="all">Toutes les sessions ({assignments.length})</option>
                  {sessionOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort by Deadline */}
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSortByDeadline((prev) => (prev === "asc" ? "desc" : "asc"))}
                className="w-full inline-flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-slate-400" />
                  <span>
                    Échéance : {sortByDeadline === "asc" ? "La plus proche" : "La plus éloignée"}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase text-[var(--cj-blue)] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {sortByDeadline.toUpperCase()}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Assignments List Grid */}
        {filteredAssignments.length === 0 ? (
          <StudentEmptyState
            title="Aucun travail trouvé"
            description={
              filter !== "all" || searchQuery || selectedSessionFilter !== "all"
                ? "Aucun devoir ne correspond aux filtres sélectionnés. Essayez de réinitialiser la recherche ou de changer de catégorie."
                : "Vous n'avez actuellement aucun devoir attribué. Vos futurs travaux apparaîtront automatiquement dès leur publication par vos enseignants."
            }
            action={
              filter !== "all" || searchQuery || selectedSessionFilter !== "all" ? (
                <button
                  onClick={() => {
                    setFilter("all");
                    setSearchQuery("");
                    setSelectedSessionFilter("all");
                  }}
                  className={studentPrimaryButtonClassName}
                >
                  Réinitialiser tous les filtres
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredAssignments.map((assign) => {
              const statusInfo = getAssignmentStatus(assign);
              const StatusIcon = statusInfo.icon;
              const submission = assign.submissions?.[0];
              const isGraded = submission?.status === "graded" || submission?.grade != null;
              const isReturned = submission?.status === "returned";
              const isPastDeadline = new Date(assign.deadline).getTime() < Date.now();

              return (
                <div
                  key={assign.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-[0_20px_45px_-15px_rgba(0,45,114,0.18)]"
                >
                  <div className="space-y-4">
                    {/* Header bar of Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-block rounded-lg border border-blue-200/80 bg-blue-50/90 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--cj-blue)] shadow-xs">
                            {assign.type?.toUpperCase() || "TP"}
                          </span>
                          {assign.difficulty && (
                            <span className="inline-block rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-slate-600">
                              Niveau {assign.difficulty}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[var(--cj-blue)] transition">
                          {assign.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{assign.formation?.title || "Formation CJ DTC"}</span>
                          {assign.session && (
                            <span className="text-slate-400 font-normal">
                              {" "}• Session du <FormattedDate date={assign.session.startDate} />
                            </span>
                          )}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 shadow-xs ${statusInfo.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed font-opensans">
                      {assign.description}
                    </p>

                    {/* Consignes / Instructions Admin */}
                    {assign.instructions && (
                      <div className="rounded-2xl border border-amber-200/90 bg-amber-50/60 p-3.5 text-xs space-y-1 shadow-xs">
                        <div className="flex items-center gap-1.5 font-bold text-amber-950 text-[11px]">
                          <Info className="h-4 w-4 text-amber-600 shrink-0" />
                          <span>Consignes & Directives de l'enseignant :</span>
                        </div>
                        <p className="text-amber-900 text-[11px] leading-relaxed font-opensans">
                          {assign.instructions}
                        </p>
                      </div>
                    )}

                    {/* Fichiers sujets transmis par l'administrateur */}
                    {assign.files && assign.files.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <FolderOpen className="h-3 w-3 text-slate-400" />
                          Sujet & Supports joints ({assign.files.length}) :
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
                                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-[11px] font-bold text-[var(--cj-blue)] hover:bg-blue-100 transition shadow-xs"
                              >
                                <Download className="h-3.5 w-3.5 text-blue-600" />
                                <span className="truncate max-w-[200px]">{fileName}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Card Correction & Evaluation Box (Grade + Feedback) */}
                    {(isGraded || isReturned) && submission && (
                      <div
                        className={`rounded-2xl border p-4 space-y-2 text-xs shadow-sm ${
                          isReturned
                            ? "border-amber-300 bg-amber-50/70"
                            : "border-emerald-300 bg-emerald-50/70"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <Sparkles className={`h-4 w-4 ${isReturned ? 'text-amber-600' : 'text-emerald-600'}`} />
                            <span>{isReturned ? "Demande de révision :" : "Résultat de l'évaluation :"}</span>
                          </div>
                          <span
                            className={`text-xs font-black px-3 py-1 rounded-xl text-white shadow-sm ${
                              isReturned ? "bg-amber-600" : "bg-emerald-600"
                            }`}
                          >
                            {submission.grade !== null && submission.grade !== undefined
                              ? `${submission.grade} / 20`
                              : "-- / 20"}
                          </span>
                        </div>

                        {submission.feedback && (
                          <div className="pt-2 border-t border-slate-200/80 space-y-1">
                            <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                              Commentaire de l'enseignant :
                            </p>
                            <p className="text-[11px] text-slate-700 leading-relaxed font-opensans pl-4 border-l-2 border-slate-300 italic">
                              "{submission.feedback}"
                            </p>
                          </div>
                        )}

                        {submission.gradedAt && (
                          <p className="text-[10px] text-slate-500 pt-1 text-right italic">
                            Corrigé le <FormattedDate date={submission.gradedAt} />
                          </p>
                        )}
                      </div>
                    )}

                    {/* Fichiers remis par l'étudiant */}
                    {submission?.files && submission.files.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <FileCode2 className="h-3 w-3 text-slate-400" />
                            Votre travail transmis ({submission.files.length}) :
                          </p>
                          {submission.submittedAt && (
                            <span className="text-[10px] text-slate-400 font-medium">
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
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-700 transition shadow-xs"
                              >
                                <Download className="h-3.5 w-3.5 text-blue-600" />
                                <span className="truncate max-w-[170px]">{fileName}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions & Deadline */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                      <Clock className={`h-4 w-4 ${isPastDeadline ? 'text-red-500' : 'text-slate-400'}`} />
                      <span className={isPastDeadline ? 'text-red-600 font-bold' : ''}>
                        Date limite : <FormattedDate date={assign.deadline} />
                      </span>
                    </div>

                    {(!submission || (assign.allowResubmission !== false && !isGraded) || isReturned) && (
                      <button
                        onClick={() => setSelectedAssignment(assign)}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm active:scale-95 ${
                          submission
                            ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                            : "bg-[var(--cj-blue)] hover:bg-[var(--cj-blue-700)] text-white"
                        }`}
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
        onClose={() => {
          setSelectedAssignment(null);
          setUploadErrorMessage("");
          setUploadSuccessMessage("");
        }}
        onSubmit={handleAssignmentSubmit}
        uploadErrorMessage={uploadErrorMessage}
        uploadSuccessMessage={uploadSuccessMessage}
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

