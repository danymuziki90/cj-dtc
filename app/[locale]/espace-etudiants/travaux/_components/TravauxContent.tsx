"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  StudentPageShell,
  studentPrimaryButtonClassName,
  studentStatusClass,
} from "@/components/ui/student-space";
import {
  AlertCircle,
  FileText,
  Search,
  Upload,
  Clock,
  CheckCircle2,
  CalendarDays,
  Download,
} from "lucide-react";
import AssignmentDetailsModal from "./AssignmentDetailsModal";
import { getAssignmentStatus } from "../../_components/utils";
import { canStudentSubmitAssignment, hasStudentSubmission } from "@/lib/submission-rules";

export default function TravauxContent() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "fr";
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [summary, setSummary] = useState({ toSubmit: 0, submitted: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all");
  
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  
  const fetchAssignments = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const response = await fetch(`/api/student/assignments?t=${Date.now()}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/${locale}/auth/student-login`);
          return;
        }
        throw new Error("Erreur de chargement des travaux");
      }
      
      const data = await response.json();
      setAssignments(data.assignments || []);
      setSummary(data.summary || { toSubmit: 0, submitted: 0 });
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    
    if (!supabase) return;
    
    const assignmentsChannel = supabase.channel("assignments_travaux_channel")
      .on("broadcast", { event: "assignment_created" }, () => fetchAssignments(false))
      .on("broadcast", { event: "assignment_updated" }, () => fetchAssignments(false))
      .on("broadcast", { event: "assignment_deleted" }, () => fetchAssignments(false));

    const submissionsChannel = supabase.channel("submissions_travaux_channel")
      .on("broadcast", { event: "submission_created" }, () => fetchAssignments(false))
      .on("broadcast", { event: "submission_graded" }, () => fetchAssignments(false));

    assignmentsChannel.subscribe();
    submissionsChannel.subscribe();
    
    return () => {
      supabase?.removeChannel(assignmentsChannel);
      supabase?.removeChannel(submissionsChannel);
    };
  }, []);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assign) => {
      const matchesSearch =
        assign.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assign.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
      if (!matchesSearch) return false;
      
      const statusInfo = getAssignmentStatus(assign);
      if (filter === "all") return true;
      if (filter === "pending" && canStudentSubmitAssignment(assign)) return true;
      if (filter === "submitted" && hasStudentSubmission(assign)) return true;
      if (filter === "graded" && statusInfo.status === "graded") return true;
      
      return false;
    });
  }, [assignments, searchQuery, filter]);

  return (
    <>
      <StudentPageShell
        title="Mes Travaux et Projets"
        eyebrow="Espace Pédagogique"
        description="Retrouvez ici tous vos devoirs, projets et examens. Consultez les consignes, téléversez vos rendus et suivez vos évaluations en temps réel."
        icon={FileText}
        backHref={`/${locale}/espace-etudiants`}
        backLabel="Retour au dashboard"
        metrics={[
          {
            label: "À remettre",
            value: summary.toSubmit,
            icon: Clock,
            accent: "from-amber-500 via-amber-600 to-amber-700",
            helper: "Devoirs en attente d'un rendu.",
          },
          {
            label: "Rendus",
            value: summary.submitted,
            icon: CheckCircle2,
            accent: "from-emerald-500 via-emerald-600 to-teal-700",
            helper: "Travaux transmis ou corrigés.",
          },
        ]}
      >
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-1">
            <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  filter === "all" ? "bg-white text-[var(--cj-blue)] shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  filter === "pending" ? "bg-white text-[var(--cj-blue)] shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                À remettre
              </button>
              <button
                onClick={() => setFilter("submitted")}
                className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  filter === "submitted" ? "bg-white text-[var(--cj-blue)] shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Rendus
              </button>
              <button
                onClick={() => setFilter("graded")}
                className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  filter === "graded" ? "bg-white text-[var(--cj-blue)] shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Corrigés
              </button>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un devoir..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition-all"
              />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 border border-red-100 text-red-600">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && !assignments.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-[24px] border border-slate-100 p-6 h-64 shadow-sm" />
              ))}
            </div>
          ) : filteredAssignments.length === 0 ? (
            /* Empty State */
            <div className="rounded-[32px] border border-dashed border-slate-200 bg-slate-50/50 px-6 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-slate-900">Aucun travail trouvé</h3>
              <p className="mt-2 text-sm text-slate-500">
                {searchQuery || filter !== "all" 
                  ? "Aucun résultat ne correspond à vos critères de recherche." 
                  : "Vous n'avez aucun devoir à remettre pour le moment."}
              </p>
            </div>
          ) : (
            /* Assignments Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((assign) => {
                const statusInfo = getAssignmentStatus(assign);
                const submission = assign.submissions?.[0] || assign.Submission?.[0];
                
                return (
                  <div
                    key={assign.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_40px_-24px_rgba(0,45,114,0.3)]"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase border ${statusInfo.className}`}>
                          <statusInfo.icon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>
                        
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                          {assign.type?.toUpperCase() || "TP"}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-[var(--cj-blue)] transition-colors">
                        {assign.title}
                      </h3>
                      
                      <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {assign.description}
                      </p>
                      
                      <div className="mt-5 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {assign.formation?.title || "Formation"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>
                            Pour le {new Date(assign.deadline).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long' })}
                          </span>
                        </div>
                        {submission && (
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 space-y-2 text-xs text-slate-700">
                            <p className="font-semibold text-emerald-800">
                              Soumis le {new Date(submission.submittedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                            {submission.grade != null && (
                              <p><span className="font-semibold">Note :</span> {submission.grade} / {submission.maxGrade ?? assign.maxGrade ?? 20}</p>
                            )}
                            {submission.feedback && (
                              <p className="line-clamp-2"><span className="font-semibold">Commentaire :</span> {submission.feedback}</p>
                            )}
                            {submission.files?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {submission.files.map((file: any) => (
                                  <a
                                    key={file.id}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex max-w-full items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2 py-1 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-100"
                                  >
                                    <Download className="h-3 w-3 shrink-0" />
                                    <span className="truncate max-w-[160px]">{file.originalName || file.name}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedAssignment(assign)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:border-[var(--cj-blue)] hover:text-[var(--cj-blue)] hover:bg-blue-50/30 transition-all"
                      >
                        {statusInfo.status === "graded" ? "Consulter la note" : 
                         statusInfo.status === "submitted" ? "Voir mon rendu" : 
                         "Ouvrir le devoir"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </StudentPageShell>

      {/* Détails du devoir (Modale) */}
      <AssignmentDetailsModal 
        isOpen={!!selectedAssignment}
        onClose={() => {
          setSelectedAssignment(null);
          fetchAssignments(false);
        }}
        assignment={selectedAssignment}
      />
    </>
  );
}
