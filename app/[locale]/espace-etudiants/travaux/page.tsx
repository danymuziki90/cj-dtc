"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  Search,
  FolderOpen,
  FileText,
  Clock,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  ArrowUpDown,
} from "lucide-react";

import { StudentPageShell, StudentSectionCard, studentMutedButtonClassName, studentPrimaryButtonClassName } from "@/components/ui/student-space";
import { AssignmentCard } from "./_components/AssignmentCard";
import { AssignmentEmptyState } from "./_components/AssignmentEmptyState";
import { AssignmentSkeleton } from "./_components/AssignmentSkeleton";
import { SubmitWorkDialog, UploadedFileData } from "./_components/SubmitWorkDialog";

// Same interface shape from the API
interface Assignment {
  id: number;
  title: string;
  type: string;
  description: string;
  instructions?: string | null;
  difficulty?: string | null;
  deadline: string;
  allowResubmission?: boolean;
  formation?: { title: string };
  session?: { id: number; startDate: string };
  files?: any[];
  submissions?: any[];
}

export default function TravauxPage() {
  const params = useParams<{ locale?: string }>();
  const searchParams = useSearchParams();
  const locale = params?.locale || "fr";

  const initialFilter = searchParams?.get("filter") || "all";
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and state
  const [filter, setFilter] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>("all");
  const [sortByDeadline, setSortByDeadline] = useState<"asc" | "desc">("asc");

  // Modal
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchAssignments = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const response = await fetch(`/api/student/assignments?t=${Date.now()}`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setAssignments(Array.isArray(data) ? data : data.assignments || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des travaux:", error);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();

    if (!supabase) return;

    // Realtime Sync with Admin Dashboard
    const assignmentsChannel = supabase.channel("assignments_channel")
      .on("broadcast", { event: "assignment_created" }, () => fetchAssignments(false))
      .on("broadcast", { event: "assignment_updated" }, () => fetchAssignments(false))
      .on("broadcast", { event: "assignment_deleted" }, () => fetchAssignments(false));

    const submissionsChannel = supabase.channel("submissions_channel")
      .on("broadcast", { event: "submission_created" }, () => fetchAssignments(false))
      .on("broadcast", { event: "submission_graded" }, () => fetchAssignments(false));

    assignmentsChannel.subscribe();
    submissionsChannel.subscribe();

    return () => {
      supabase?.removeChannel(assignmentsChannel);
      supabase?.removeChannel(submissionsChannel);
    };
  }, []);

  const handleAssignmentSubmit = async (uploadedFiles: UploadedFileData[]) => {
    if (!selectedAssignment || uploadedFiles.length === 0) return;
    setIsSubmittingWork(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/student/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          files: uploadedFiles,
        }),
      });

      const resData = await response.json().catch(() => ({}));
      if (!response.ok || resData.success === false) {
        throw new Error(resData.message || resData.error || "Échec de l'envoi.");
      }

      await fetchAssignments(false);
      setSelectedAssignment(null);
    } catch (err: any) {
      setSubmitError(err.message || "Erreur lors de l'enregistrement du dépôt.");
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // KPIs
  const pendingCount = useMemo(() => assignments.filter(a => {
    const sub = a.submissions?.[0];
    const isReturned = sub?.status === "returned";
    const hasSub = a.submissions && a.submissions.length > 0;
    const isFuture = new Date(a.deadline).getTime() >= Date.now();
    return (!hasSub && isFuture) || isReturned;
  }).length, [assignments]);

  const submittedCount = useMemo(() => assignments.filter(a => {
    const hasSub = a.submissions && a.submissions.length > 0;
    if (!hasSub) return false;
    return !a.submissions?.some(s => s.status === "graded" || s.status === "returned" || s.grade != null);
  }).length, [assignments]);

  const evaluatedCount = useMemo(() => assignments.filter(a => 
    a.submissions?.some(s => s.status === "graded" || s.status === "returned" || s.grade != null)
  ).length, [assignments]);

  const sessionOptions = useMemo(() => {
    const map = new Map<number, string>();
    assignments.forEach((a) => {
      if (a.session) {
        const d = a.session.startDate ? new Date(a.session.startDate).toLocaleDateString("fr-FR") : "";
        map.set(a.session.id, `${a.formation?.title || "Session"} (${d})`);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id: String(id), label }));
  }, [assignments]);

  // Filtering Logic
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((item) => {
        const sub = item.submissions?.[0];
        const isReturned = sub?.status === "returned";
        const hasSub = item.submissions && item.submissions.length > 0;
        const isEvaluated = item.submissions?.some(s => s.status === "graded" || s.status === "returned" || s.grade != null);

        if (filter === "pending") {
          const isFuture = new Date(item.deadline).getTime() >= Date.now();
          if ((hasSub && !isReturned) || (!isReturned && !isFuture)) return false;
        }
        if (filter === "submitted" && (!hasSub || isEvaluated)) return false;
        if (filter === "evaluated" && !isEvaluated) return false;

        if (selectedSessionFilter !== "all" && String(item.session?.id) !== selectedSessionFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          if (!item.title?.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.deadline).getTime();
        const timeB = new Date(b.deadline).getTime();
        return sortByDeadline === "asc" ? timeA - timeB : timeB - timeA;
      });
  }, [assignments, filter, searchQuery, selectedSessionFilter, sortByDeadline]);

  const metrics = [
    { label: "À remettre", value: pendingCount, helper: "Devoirs en cours", icon: Clock, accent: "from-red-600 to-rose-900" },
    { label: "Travaux rendus", value: submittedCount, helper: "En attente de correction", icon: CheckCircle2, accent: "from-emerald-600 to-teal-800" },
    { label: "Évalués & Notés", value: evaluatedCount, helper: "Notes et retours", icon: FileCheck2, accent: "from-[var(--cj-blue)] to-indigo-900" },
  ];

  return (
    <StudentPageShell
      locale={locale}
      actions={
        <Link href={`/${locale}/espace-etudiants`} className={studentMutedButtonClassName}>
          Retour au tableau de bord
        </Link>
      }
    >
      <StudentSectionCard
        eyebrow="Portail Devoirs"
        title="Liste de vos travaux"
        description="Filtrez, triez et consultez vos devoirs actuels ou passés."
        icon={FolderOpen}
      >
        <div className="space-y-4 border-b border-slate-200 pb-6 mb-8">
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {["all", "pending", "submitted", "evaluated"].map((f) => {
              const labels: Record<string, string> = { all: "Tous", pending: "À remettre", submitted: "Rendus", evaluated: "Évalués" };
              const colors: Record<string, string> = {
                all: filter === "all" ? "bg-white text-[var(--cj-blue)] shadow-md scale-105" : "text-slate-600 hover:bg-slate-200",
                pending: filter === "pending" ? "bg-red-600 text-white shadow-md scale-105" : "text-slate-600 hover:bg-slate-200",
                submitted: filter === "submitted" ? "bg-emerald-600 text-white shadow-md scale-105" : "text-slate-600 hover:bg-slate-200",
                evaluated: filter === "evaluated" ? "bg-[var(--cj-blue)] text-white shadow-md scale-105" : "text-slate-600 hover:bg-slate-200",
              };
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${colors[f]}`}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            {sessionOptions.length > 0 && (
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  value={selectedSessionFilter}
                  onChange={(e) => setSelectedSessionFilter(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-10 pr-8 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                >
                  <option value="all">Toutes les sessions ({assignments.length})</option>
                  {sessionOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => setSortByDeadline(prev => prev === "asc" ? "desc" : "asc")}
              className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-slate-400" />
                <span>Échéance</span>
              </div>
              <span className="text-[10px] font-bold uppercase text-[var(--cj-blue)] bg-blue-50 px-2 rounded border border-blue-100">
                {sortByDeadline.toUpperCase()}
              </span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => <AssignmentSkeleton key={i} />)}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <AssignmentEmptyState
            title="Aucun travail trouvé"
            description={
              filter !== "all" || searchQuery || selectedSessionFilter !== "all"
                ? "Aucun devoir ne correspond à vos filtres."
                : "Vous n'avez aucun devoir attribué pour le moment."
            }
            action={
              filter !== "all" || searchQuery || selectedSessionFilter !== "all" ? (
                <button
                  onClick={() => { setFilter("all"); setSearchQuery(""); setSelectedSessionFilter("all"); }}
                  className={studentPrimaryButtonClassName}
                >
                  Réinitialiser les filtres
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredAssignments.map((assign, i) => (
              <AssignmentCard
                key={assign.id}
                assign={assign}
                index={i}
                onOpenSubmitDialog={setSelectedAssignment}
              />
            ))}
          </div>
        )}
      </StudentSectionCard>

      <SubmitWorkDialog
        isOpen={!!selectedAssignment}
        onClose={() => {
          setSelectedAssignment(null);
          setSubmitError("");
        }}
        onSubmit={handleAssignmentSubmit}
        assignmentTitle={selectedAssignment?.title || ""}
        isSubmitting={isSubmittingWork}
        errorMessage={submitError}
      />
    </StudentPageShell>
  );
}
