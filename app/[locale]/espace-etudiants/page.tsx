"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileDown,
  FileText,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Loader2,
  LogOut,
  MapPinIcon,
  MessageSquare,
  Newspaper,
  Phone,
  Plus,
  Send,
  ShieldCheck,
  Sparkle,
  UserIcon,
  X,
  Laptop,
  CalendarDays,
} from "lucide-react";
import {
  StudentEmptyState as EmptyState,
  StudentMetricCard as MetricCard,
  StudentSectionCard as SectionCard,
  studentInputClassName,
  studentPrimaryButtonClassName,
  studentSecondaryButtonClassName,
  studentStatusClass,
} from "@/components/ui/student-space";

type DashboardPayload = any;

function statusClass(value: string) {
  return studentStatusClass(value);
}

function translateEnrollmentStatus(status: string) {
  const map: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Accepté',
    confirmed: 'Confirmé',
    rejected: 'Non retenu',
    waitlist: 'Sur liste d\'attente',
    cancelled: 'Annulé',
    completed: 'Terminé'
  }
  return map[status] || status
}

function lifecycleLabel(value?: string | null) {
  if (value === "upcoming") return "À venir";
  if (value === "active") return "Active";
  if (value === "completed") return "Terminée";
  return "Inconnu";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString("fr-FR") : "-";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function EspaceEtudiantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "fr";
  const pendingFormationId = searchParams.get("formationId");
  const pendingSessionId = searchParams.get("sessionId");
  const pendingEnrollmentPath = pendingFormationId
    ? `/${locale}/espace-etudiants/confirm-inscription?formationId=${encodeURIComponent(
        pendingFormationId,
      )}${pendingSessionId ? `&sessionId=${encodeURIComponent(pendingSessionId)}` : ""}`
    : "";

  // Core Data States
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState("overview"); // overview, formations, travaux, news, calendrier, notifications, support

  // Support / Questions State
  const [question, setQuestion] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);

  // News Modal State
  const [selectedNewsForModal, setSelectedNewsForModal] = useState<any | null>(null);

  async function loadDashboard() {
    setLoading(true);
    try {
      const response = await fetch("/api/student/system/dashboard", {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        setAuthError(
          payload.error ||
            "Vous devez vous connecter pour accéder à l'espace étudiant.",
        );
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setAuthError(payload.error || "Impossible de charger le dashboard.");
        setLoading(false);
        return;
      }

      setData(payload);
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setAuthError("Une erreur est survenue lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // Global variables extracted from data payload
  const student = data?.student || {};
  const dashboard = data?.dashboard || {};
  const metrics = dashboard.metrics || {};
  const progress = dashboard.progress || {};
  const submissions = dashboard.submissions || [];
  const notifications = dashboard.notifications || [];
  const questions = dashboard.questions || [];
  const resources = dashboard.resources || [];
  const sessionsHistory = dashboard.sessionsHistory || [];
  const availableSessions = dashboard.availableSessions || [];
  const certificates = dashboard.certificates || [];
  const eligibility = dashboard.certificateEligibility || {};
  const currentSession = dashboard.currentSession;
  const firstCertificate = certificates[0];
  const news = dashboard.news || [];
  const assignments = dashboard.assignments || [];

  // Calculations
  const completionRate = useMemo(() => {
    if (!data) return 0;
    const completed = progress.hoursCompleted || 0;
    const remaining = progress.hoursRemaining || 0;
    const total = completed + remaining;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [progress]);

  const activeSessionsCount = useMemo(() => {
    return sessionsHistory.filter((s: any) => s.sessionLifecycle === "active").length;
  }, [sessionsHistory]);

  const pendingAssignmentsCount = useMemo(() => {
    return assignments.filter((assign: any) => {
      const hasSub = assign.submissions && assign.submissions.length > 0;
      const isFuture = new Date(assign.deadline).getTime() >= Date.now();
      return !hasSub && isFuture;
    }).length;
  }, [assignments]);

  const submittedAssignmentsCount = useMemo(() => {
    return assignments.filter((assign: any) => assign.submissions && assign.submissions.length > 0).length;
  }, [assignments]);

  const totalFormationsCount = sessionsHistory.length;
  const totalNotifications = notifications.length;

  async function logout() {
    await fetch("/api/student/auth/logout", { method: "POST" });
    router.push(`/${locale}/auth/student-login`);
    router.refresh();
  }

  async function sendQuestion(event: FormEvent) {
    event.preventDefault();
    setQuestionError("");
    setQuestionLoading(true);

    const message = question.trim();
    if (message.length < 5) {
      setQuestionError("Votre question doit contenir au moins 5 caractères.");
      setQuestionLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/student/system/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setQuestionError(payload.error || "Échec d'envoi de la question.");
        return;
      }

      setQuestion("");
      await loadDashboard();
    } catch (error) {
      console.error("Send question error:", error);
      setQuestionError("Impossible de transmettre la question.");
    } finally {
      setQuestionLoading(false);
    }
  }

  async function handleAssignmentSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedAssignmentForSubmission || !uploadFiles || uploadFiles.length === 0) {
      setUploadErrorMessage("Veuillez choisir au moins un fichier à remettre.");
      return;
    }

    setIsSubmittingWork(true);
    setUploadErrorMessage("");
    setUploadSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("assignmentId", String(selectedAssignmentForSubmission.id));
      formData.append("fileCount", String(uploadFiles.length));

      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append(`file_${i}`, uploadFiles[i]);
      }

      const response = await fetch("/api/student/assignments", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Une erreur est survenue lors du dépôt.");
      }

      setUploadSuccessMessage("Votre travail a été déposé avec succès !");
      setUploadFiles(null);
      await loadDashboard();

      setTimeout(() => {
        setSelectedAssignmentForSubmission(null);
        setUploadSuccessMessage("");
      }, 2000);
    } catch (err: any) {
      setUploadErrorMessage(err.message || "Erreur lors du dépôt de fichier.");
    } finally {
      setIsSubmittingWork(false);
    }
  }

  // Dynamic timelines builder for Calendrier tab
  const calendarTimeline = useMemo(() => {
    const events: any[] = [];

    // Add assignment deadlines
    assignments.forEach((assign: any) => {
      const hasSub = assign.submissions && assign.submissions.length > 0;
      const isPast = new Date(assign.deadline).getTime() < Date.now();
      const isClose = (new Date(assign.deadline).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000;
      
      let evtColor = "bg-orange-500";
      if (hasSub) evtColor = "bg-emerald-500";
      else if (isPast || isClose) evtColor = "bg-red-500";

      events.push({
        id: `assign-${assign.id}`,
        date: new Date(assign.deadline),
        title: `Date limite de rendu : ${assign.title}`,
        description: `Devoir de type "${assign.type.toUpperCase()}" pour la formation ${assign.formation?.title}`,
        category: "Travaux",
        icon: FileText,
        color: evtColor,
      });
    });

    // Add session start / end dates
    sessionsHistory.forEach((session: any) => {
      if (session.startDate) {
        events.push({
          id: `start-${session.enrollmentId}`,
          date: new Date(session.startDate),
          title: `Début de session : ${session.formationTitle}`,
          description: `Format : ${session.format || "En ligne"} | Lieu : ${session.location || "DTC Central"}`,
          category: "Sessions",
          icon: GraduationCap,
          color: "bg-blue-600",
        });
      }
      if (session.endDate) {
        events.push({
          id: `end-${session.enrollmentId}`,
          date: new Date(session.endDate),
          title: `Fin de session : ${session.formationTitle}`,
          description: `Fermeture académique de la session`,
          category: "Sessions",
          icon: Award,
          color: "bg-indigo-600",
        });
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [assignments, sessionsHistory]);

  const getGradientForCategory = (category: string | null) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("rh") || cat.includes("ressources")) return "from-blue-600 to-indigo-900";
    if (cat.includes("lead") || cat.includes("manag")) return "from-violet-600 to-indigo-950";
    if (cat.includes("marketing") || cat.includes("digi")) return "from-rose-600 to-red-950";
    return "from-slate-700 via-slate-800 to-slate-900";
  };

  const getAssignmentStatus = (assign: any) => {
    const hasSub = assign.submissions && assign.submissions.length > 0;
    if (hasSub) {
      return { 
        label: "Déposé", 
        color: "border-emerald-250 bg-emerald-50 text-emerald-800",
        theme: "green",
        icon: CheckCircle2
      };
    }

    const deadlineTime = new Date(assign.deadline).getTime();
    const isPast = deadlineTime < Date.now();
    if (isPast) {
      return { 
        label: "En retard", 
        color: "border-red-250 bg-red-50 text-red-800",
        theme: "red",
        icon: AlertCircle
      };
    }

    const isClose = (deadlineTime - Date.now()) < 3 * 24 * 60 * 60 * 1000;
    if (isClose) {
      return { 
        label: "À remettre", 
        color: "border-red-250 bg-red-50 text-red-800",
        theme: "red",
        icon: Clock
      };
    }

    return { 
      label: "En cours", 
      color: "border-orange-200 bg-orange-50 text-orange-800",
      theme: "orange",
      icon: Activity
    };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#041224_0%,#002d72_45%,#eef5ff_100%)] px-4">
        <div className="w-full max-w-md rounded-[30px] border border-white/20 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
            Espace Étudiant
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
            <h1 className="text-xl font-semibold">Chargement de la plateforme...</h1>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/80">
            Nous préparons vos cours, vos travaux et vos actualités dans votre tableau de bord CJ DTC.
          </p>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-2/3 rounded-full bg-[var(--cj-red)] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (authError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_55%,#fff1f2_100%)] px-4 py-10">
        <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_30px_90px_-35px_rgba(0,45,114,0.4)]">
          <div className="bg-[linear-gradient(120deg,#001737_0%,#002d72_52%,#0c4da2_100%)] px-8 py-10 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
              Espace Étudiant
            </p>
            <h1 className="mt-4 text-3xl font-semibold">
              Connexion requise
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
              Veuillez vous authentifier pour accéder à vos cours, travaux et documents pédagogiques.
            </p>
          </div>
          <div className="space-y-5 px-8 py-8">
            <div className="rounded-3xl border border-red-100 bg-red-50/70 p-5 text-sm text-slate-700">
              {authError || "Accès refusé."}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/auth/student-login${
                  pendingEnrollmentPath
                    ? `?next=${encodeURIComponent(pendingEnrollmentPath)}`
                    : ""
                }`}
                className="rounded-2xl bg-[var(--cj-blue)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--cj-blue-700)]"
              >
                Se connecter
              </Link>
              <Link
                href={`/${locale}/auth/student-register${
                  pendingEnrollmentPath
                    ? `?next=${encodeURIComponent(pendingEnrollmentPath)}`
                    : ""
                }`}
                className="rounded-2xl bg-[var(--cj-red)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--cj-red-700)]"
              >
                Créer un compte
              </Link>
              <Link
                href={`/${locale}`}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-[var(--cj-blue)]"
              >
                Retour accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const studentInitial = (
    student.firstName?.[0] ||
    student.fullName?.[0] ||
    "E"
  ).toUpperCase();

  const heroSummary = currentSession
    ? `Vous suivez actuellement la formation : ${currentSession.formationTitle}. Retrouvez l'ensemble de votre suivi ci-dessous.`
    : "Bienvenue dans votre tableau de bord. Retrouvez vos cours et échéances académiques en un coup d'œil.";

  const heroStats = [
    {
      icon: CalendarDays,
      label: "Période active",
      value: currentSession
        ? `${formatDate(currentSession.startDate)} - ${formatDate(currentSession.endDate)}`
        : "Pas de session active",
    },
    {
      icon: MapPinIcon,
      label: "Lieu / Format",
      value: currentSession
        ? [currentSession.location, currentSession.format].filter(Boolean).join(" | ")
        : "Session à venir",
    },
    {
      icon: Phone,
      label: "Contact WhatsApp",
      value: student.whatsapp || "Non renseigné",
    },
  ];

  const basePath = `/${locale}/espace-etudiants`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-800">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#020617_0%,#0b1629_18%,#f1f5f9_58%,#f8fafc_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top_left,rgba(12,77,162,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(227,6,19,0.12),transparent_25%)]" />

      {/* Modern top header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={student.fullName}
                className="h-10 w-10 rounded-xl border border-white/20 object-cover shadow"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 font-bold text-white shadow ring-1 ring-white/10">
                {studentInitial}
              </div>
            )}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
                Espace Étudiant | LMS
              </p>
              <h1 className="text-sm font-semibold text-white">
                {student.fullName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`${basePath}/mon-compte`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 transition"
            >
              <UserIcon className="h-3.5 w-3.5" />
              Mon compte
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--cj-red)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--cj-red-700)] shadow"
            >
              <LogOut className="h-3.5 w-3.5" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        
        {/* SECTION 1: HERO - Improved color contrast with #FFFFFF (text-white) */}
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-5 text-white shadow-2xl border border-white/10 sm:p-6">
          <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-[rgba(227,6,19,0.15)] blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          
          <div className="relative grid gap-5 xl:grid-cols-[1.5fr_0.95fr]">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white">
                <Sparkle className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
                Tableau de bord étudiant
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight leading-tight sm:text-4xl text-white">
                Pilotage complet de votre parcours
              </h1>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">Statut étudiant :</span>
                <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${statusClass(student.status)}`}>
                  {student.status}
                </span>
              </div>

              <p className="max-w-2xl text-sm leading-6 text-white">
                {heroSummary}
              </p>

              <div className="grid gap-2 pt-1 md:grid-cols-3">
                {heroStats.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/5 bg-white/5 p-3 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                      <Icon className="h-3.5 w-3.5 text-blue-400" />
                      {label}
                    </div>
                    <p className="mt-2 text-xs font-medium leading-relaxed text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href={`${basePath}/supports`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/25 transition"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="text-white">Supports de cours</span>
                </Link>
                {firstCertificate && firstCertificate.fileUrl && (
                  <a
                    href={firstCertificate.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/25 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Mon certificat
                  </a>
                )}
              </div>
            </div>

            {/* Circular Progress & Certificate Eligibility widget */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 backdrop-blur shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Progression globale de la session
                </p>
                <div className="mt-4 flex items-center gap-5">
                  <div
                    className="relative flex h-24 w-24 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#e30613 0% ${completionRate}%, rgba(255,255,255,0.1) ${completionRate}% 100%)`,
                    }}
                  >
                    <div className="flex h-18 w-18 items-center justify-center rounded-full bg-slate-950 text-center shadow-lg">
                      <div>
                        <p className="text-lg font-bold text-white leading-none">
                          {completionRate}%
                        </p>
                        <p className="text-[9px] uppercase tracking-[0.1em] text-white/40 mt-1">
                          Complété
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-white/70">
                    <div>
                      <span className="block text-[9px] uppercase tracking-[0.15em] text-white/40">Heures Validées</span>
                      <span className="text-sm font-semibold text-white">{progress.hoursCompleted ?? 0} h</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-[0.15em] text-white/40">Restant à valider</span>
                      <span className="text-sm font-semibold text-white">{progress.hoursRemaining ?? 0} h</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                      Éligibilité au certificat
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">
                      {eligibility.eligible ? "Prêt pour la délivrance" : "Critères d'évaluation en cours"}
                    </p>
                  </div>
                  <ShieldCheck className={`h-7 w-7 ${eligibility.eligible ? 'text-emerald-400' : 'text-blue-400'}`} />
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-xl bg-slate-950/20 px-3 py-2 border border-white/5">
                    <span className="text-white/80">Projet académique validé</span>
                    {eligibility.projectValidated ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-950/20 px-3 py-2 border border-white/5">
                    <span className="text-white/80">
                      Taux de présence {eligibility.attendanceRate !== null ? `(${eligibility.attendanceRate}%)` : ""}
                    </span>
                    {eligibility.attendanceValidated ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NAVIGATION TABS WITH MICRO-ANIMATIONS */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white/95 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
          <nav className="flex flex-wrap gap-1.5">
            {[
              { id: "overview", label: "Tableau de bord", icon: BarChart3, count: null },
              { id: "formations", label: "Mes formations", icon: BookOpen, count: totalFormationsCount },
              { id: "travaux", label: "Mes travaux", icon: FileText, count: pendingAssignmentsCount, activeCount: true },
              { id: "news", label: "Actualités", icon: Newspaper, count: news.length },
              { id: "calendrier", label: "Calendrier", icon: Calendar, count: null },
              { id: "notifications", label: "Notifications", icon: Bell, count: totalNotifications },
              { id: "support", label: "Support & Questions", icon: HelpCircle, count: null },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-100
                    ${
                      isActive
                        ? "bg-[var(--cj-blue)] text-white shadow-lg shadow-blue-900/10 animate-fade-in"
                        : "text-slate-700 hover:bg-slate-100 hover:text-[var(--cj-blue)]"
                    }`}
                >
                  <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-500 group-hover:text-[var(--cj-blue)]"}`} />
                  {tab.label}
                  {tab.count !== null && tab.count > 0 && (
                    <span
                      className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow-sm transition-colors
                        ${
                          isActive
                            ? "bg-white text-[var(--cj-blue)]"
                            : tab.activeCount
                              ? "bg-[var(--cj-red)] text-white"
                              : "bg-slate-200 text-slate-700"
                        }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
            <Link
              href={`/${locale}/espace-etudiants/temoignages`}
              className="group flex items-center gap-2 rounded-2xl bg-[var(--cj-blue)]/90 px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--cj-blue)] focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <MessageSquare className="h-4 w-4 text-white transition-transform group-hover:scale-110" />
              Partager mon expérience
            </Link>
          </nav>
        </div>

        {/* SECTION 2: STATS CARD ROW - VUE D'ENSEMBLE */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Card 1: Sessions (Bleu) */}
          <div className="group relative overflow-hidden rounded-[26px] border border-blue-100 bg-white/90 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 hover:bg-blue-50/20">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-[var(--cj-blue)]" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sessions</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-blue-100">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{totalFormationsCount}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Inscriptions enregistrées</p>
          </div>

          {/* Card 2: En cours (Orange) */}
          <div className="group relative overflow-hidden rounded-[26px] border border-orange-100 bg-white/90 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-orange-200 hover:bg-orange-50/20">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">En cours</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-orange-100">
                <Activity className="h-4 w-4 animate-pulse" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{activeSessionsCount}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Sessions actives</p>
          </div>

          {/* Card 3: À remettre (Rouge) */}
          <div className="group relative overflow-hidden rounded-[26px] border border-red-100 bg-white/90 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-red-200 hover:bg-red-50/20">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-[var(--cj-red)]" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">À remettre</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-red-100">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{pendingAssignmentsCount}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Travaux restants</p>
          </div>

          {/* Card 4: Déposés (Vert) */}
          <div className="group relative overflow-hidden rounded-[26px] border border-emerald-100 bg-white/90 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-200 hover:bg-emerald-50/20">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Déposés</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{submittedAssignmentsCount}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Travaux soumis</p>
          </div>

          {/* Card 5: Actualités (Violet/Indigo) */}
          <div className="group relative overflow-hidden rounded-[26px] border border-indigo-100 bg-white/90 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200 hover:bg-indigo-50/20">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Actualités</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-indigo-100">
                <Newspaper className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{news.length}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Annonces récentes</p>
          </div>
        </section>

        {/* DYNAMIC CONTENT CONTAINER BASED ON TAB */}
        <div className="space-y-8">
          
          {/* TAB 1: OVERVIEW (TABLE DE BORD HOMEPAGE) */}
          {activeTab === "overview" && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Formations & Deadlines previews */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Active Session Info */}
                {currentSession ? (
                  <div className="rounded-2xl border border-white bg-white/60 p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Session active</span>
                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                          {currentSession.formationTitle}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Format : <span className="font-semibold text-slate-700">{currentSession.format}</span> | Lieu : <span className="font-semibold text-slate-700">{currentSession.location}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("formations")}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--cj-blue)] hover:underline"
                      >
                        Suivre le cours
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50/50 p-4 border border-slate-100">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Évaluation de présence</span>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {eligibility.attendanceRate !== null ? `${eligibility.attendanceRate}% de présence` : "Présence en cours de relevé"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50/50 p-4 border border-slate-100">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Rendus du projet</span>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {eligibility.projectValidated ? "Projet validé par l'administration" : "Projet en attente de validation"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 text-center">
                    <GraduationCap className="mx-auto h-10 w-10 text-slate-300" />
                    <h3 className="mt-2 text-sm font-bold text-slate-800">Aucune session active</h3>
                    <p className="mt-1 text-xs text-slate-500 mb-4">
                      Vous n'êtes pas encore affecté à une session de cours active pour le moment.
                    </p>
                    <button
                      onClick={() => setActiveTab("formations")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--cj-blue)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--cj-blue-700)] transition shadow-sm"
                    >
                      Découvrir les sessions disponibles
                    </button>
                  </div>
                )}

                {/* Sessions ouvertes : visible dès l'arrivée sur le tableau de bord. */}
                <section className="rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--cj-red)]">Découvrir</p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">Sessions ouvertes</h3>
                      <p className="mt-1 text-xs text-slate-500">Inscrivez-vous aux prochaines sessions actuellement disponibles.</p>
                    </div>
                    <button onClick={() => setActiveTab("formations")} className="text-xs font-bold text-[var(--cj-blue)] hover:underline">Voir toutes</button>
                  </div>
                  {availableSessions.length > 0 ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {availableSessions.slice(0, 3).map((session: any) => (
                        <article key={session.id} className="overflow-hidden rounded-xl border border-white bg-white shadow-sm">
                          <div className="p-4">
                            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-700">Inscriptions ouvertes</span>
                            <h4 className="mt-3 line-clamp-2 text-sm font-bold text-slate-900">{session.formationTitle}</h4>
                            <p className="mt-2 text-[11px] text-slate-600">{formatDateShort(session.startDate)} · {session.format}</p>
                            <p className="mt-1 text-[11px] font-semibold text-[var(--cj-blue)]">{session.availableSpots} place{session.availableSpots > 1 ? 's' : ''} restante{session.availableSpots > 1 ? 's' : ''}</p>
                            <Link href={`/${locale}/espace-etudiants/confirm-inscription?formationId=${session.formationId}&sessionId=${session.id}`} className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[var(--cj-blue)] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[var(--cj-blue-700)]">S'inscrire <ArrowRight className="h-3 w-3" /></Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-5 rounded-xl border border-dashed border-blue-200 bg-white/70 p-4 text-center text-xs text-slate-500">Aucune session ouverte n’est disponible pour le moment.</p>
                  )}
                </section>

                {/* Next deadlines preview */}
                <div className="rounded-2xl border border-white bg-white/60 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-500" />
                      Prochaines échéances
                    </h3>
                    <button
                      onClick={() => setActiveTab("travaux")}
                      className="text-xs font-bold text-[var(--cj-blue)] hover:underline"
                    >
                      Voir tout
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {assignments.slice(0, 3).map((assign: any) => {
                      const status = getAssignmentStatus(assign);
                      const iconBg = 
                        status.theme === "green" ? "bg-emerald-50 text-emerald-600" :
                        status.theme === "orange" ? "bg-orange-50 text-orange-600" :
                        "bg-red-50 text-red-600";
                      
                      return (
                        <div key={assign.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:translate-x-1 transition-transform">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${iconBg}`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 leading-tight">{assign.title}</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">{assign.formation?.title}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${status.color} mb-1`}>
                              {status.label}
                            </span>
                            <p className="text-[9px] text-slate-400 font-medium">
                              Limite : {formatDateShort(assign.deadline)}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {assignments.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">Aucun devoir à rendre.</p>
                    )}
                  </div>
                </div>

                {/* News quick preview */}
                <div className="rounded-2xl border border-white bg-white/60 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-blue-500" />
                      Actualités récentes
                    </h3>
                    <button
                      onClick={() => setActiveTab("news")}
                      className="text-xs font-bold text-[var(--cj-blue)] hover:underline"
                    >
                      Toutes les actus
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {news.slice(0, 2).map((item: any) => (
                      <div key={item.id} className="group overflow-hidden rounded-xl border border-slate-100 bg-white hover:-translate-y-1 transition-all border-l-4 border-l-indigo-500">
                        {item.imageData ? (
                          <img src={item.imageData} alt={item.title} className="w-full h-32 object-cover" />
                        ) : (
                          <div className="w-full h-32 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 flex items-center justify-center">
                            <Newspaper className="w-8 h-8 text-indigo-300/85" />
                          </div>
                        )}
                        <div className="p-4">
                          <span className="inline-block text-[9px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                            {item.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                            {item.content}
                          </p>
                          <button
                            onClick={() => setSelectedNewsForModal(item)}
                            className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                          >
                            Lire la suite
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {news.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4 col-span-2">Aucune actualité disponible.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column - Questions & Support widget + Mini Notifications Stream */}
              <div className="space-y-6">
                
                {/* Unified Notifications Feed */}
                <div className="rounded-2xl border border-white bg-white/60 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    Activités récentes
                  </h3>
                  
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                    {notifications.slice(0, 5).map((noti: any) => (
                      <div key={noti.id} className="flex gap-3 text-xs border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="flex h-2 w-2 rounded-full bg-blue-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950 leading-tight">{noti.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal">{noti.message}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">{formatDateTime(noti.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                    
                    {notifications.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">Pas d'activité récente.</p>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className="w-full text-center text-xs font-bold text-[var(--cj-blue)] mt-4 hover:underline"
                  >
                    Voir toutes les notifications
                  </button>
                </div>

                {/* Quick Support / Questions form */}
                <div className="rounded-2xl border border-white bg-white/60 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    Poser une question
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-normal mb-4">
                    Une difficulté sur un cours ou un paiement ? Écrivez directement au secrétariat académique.
                  </p>
                  
                  <form onSubmit={sendQuestion} className="space-y-3">
                    {questionError && (
                      <p className="rounded-xl bg-red-50 p-3 text-[10px] text-red-600 border border-red-100">
                        {questionError}
                      </p>
                    )}
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      rows={3}
                      placeholder="Votre message..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-[var(--cj-blue)] focus:ring-4 focus:ring-blue-100 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={questionLoading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-blue)] py-2 text-xs font-semibold text-white transition hover:bg-[var(--cj-blue-700)] disabled:opacity-50"
                    >
                      {questionLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Envoyer ma demande
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: FORMATIONS (MY COURSES) */}
          {activeTab === "formations" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Mes formations</h3>
                  <p className="text-xs text-slate-500">Parcourez vos programmes d'apprentissage et suivez votre progression.</p>
                </div>
                <Link
                  href={`${basePath}/elearning`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Laptop className="w-4 h-4" />
                  E-learning LMS
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sessionsHistory.map((item: any) => {
                  const borderL = item.sessionLifecycle === "active" ? "border-l-4 border-l-orange-500" : "border-l-4 border-l-blue-600";
                  return (
                    <div
                      key={item.enrollmentId}
                      className={`group flex flex-col justify-between overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${borderL}`}
                    >
                      <div>
                        {/* Course cover using formationImageUrl or gradient fallback */}
                        {item.formationImageUrl ? (
                          <div className="relative h-44 overflow-hidden">
                            <img
                              src={item.formationImageUrl}
                              alt={item.formationTitle}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className={`relative h-44 bg-gradient-to-br ${getGradientForCategory(item.formationCategory)} flex items-center justify-center p-6 text-center text-white`}>
                            <div className="absolute inset-0 bg-black/10" />
                            <GraduationCap className="absolute top-4 right-4 w-10 h-10 text-white/20" />
                            <p className="relative font-extrabold text-sm tracking-wide line-clamp-3">
                              {item.formationTitle}
                            </p>
                          </div>
                        )}

                        <div className="p-5">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${item.sessionLifecycle === "active" ? "bg-orange-50 text-orange-700 border border-orange-100" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
                            {item.formationCategory || "Programme"}
                          </span>
                          
                          <h4 className="mt-3 text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                            {item.formationTitle}
                          </h4>
                          
                          <p className="mt-2 text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                            {item.formationDescription || "Aucune description fournie par l'administration."}
                          </p>

                          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">Dates</span>
                              <span className="font-semibold text-slate-700">
                                {formatDateShort(item.startDate)} - {formatDateShort(item.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">Statut</span>
                              <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${statusClass(item.enrollmentStatus)}`}>
                                {translateEnrollmentStatus(item.enrollmentStatus)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5">
                        {/* Individual progress bar (mapped to session progression if active) */}
                        {item.sessionLifecycle === "active" ? (
                          <div className="space-y-1 mb-4">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">Progression</span>
                              <span className="font-bold text-orange-600">{completionRate}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: `${completionRate}%` }} />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1 mb-4">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">Progression</span>
                              <span className="font-bold text-slate-500">
                                {item.sessionLifecycle === "completed" ? "100%" : "0%"}
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-slate-300" style={{ width: item.sessionLifecycle === "completed" ? "100%" : "0%" }} />
                            </div>
                          </div>
                        )}

                        {['accepted', 'confirmed', 'completed'].includes(item.enrollmentStatus) ? (
                          <>
                            <Link
                              href={`${basePath}/elearning`}
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--cj-blue)] py-2 text-xs font-semibold text-white hover:bg-[var(--cj-blue-700)] transition text-center shadow-sm mb-3"
                            >
                              Continuer
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>

                            <div className="grid grid-cols-3 gap-2 mt-1 text-center border-t border-slate-100 pt-3">
                              <button
                                onClick={() => setActiveTab("calendrier")}
                                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-[10px] text-slate-600 hover:text-[var(--cj-blue)] font-bold transition-all"
                                title="Consulter le calendrier"
                              >
                                <Calendar className="w-4 h-4 mb-1 text-slate-400" />
                                Calendrier
                              </button>
                              <Link
                                href={`${basePath}/supports?formationId=${item.formationId}`}
                                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-[10px] text-slate-600 hover:text-[var(--cj-blue)] font-bold transition-all"
                                title="Accéder aux supports de cours"
                              >
                                <BookOpen className="w-4 h-4 mb-1 text-slate-400" />
                                Supports
                              </Link>
                              <button
                                onClick={() => setActiveTab("travaux")}
                                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-[10px] text-slate-600 hover:text-[var(--cj-blue)] font-bold transition-all"
                                title="Consulter vos devoirs et travaux"
                              >
                                <FileText className="w-4 h-4 mb-1 text-slate-400" />
                                Travaux
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-center text-xs space-y-1">
                            {item.enrollmentStatus === 'waitlist' && (
                              <>
                                <p className="font-extrabold text-amber-700">⏳ En liste d'attente</p>
                                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                                  Votre candidature a été placée sur liste d'attente. Nous vous contacterons dès qu'une place se libèrera.
                                </p>
                              </>
                            )}
                            {item.enrollmentStatus === 'pending' && (
                              <>
                                <p className="font-extrabold text-blue-700">🔍 Candidature en examen</p>
                                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                                  Nos équipes examinent votre dossier. Une décision vous sera notifiée très prochainement par e-mail.
                                </p>
                              </>
                            )}
                            {item.enrollmentStatus === 'rejected' && (
                              <>
                                <p className="font-extrabold text-red-600">❌ Candidature non retenue</p>
                                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                                  Votre dossier n'a pas été retenu pour cette session. N'hésitez pas à postuler à d'autres parcours.
                                </p>
                              </>
                            )}
                            {item.enrollmentStatus === 'cancelled' && (
                              <>
                                <p className="font-extrabold text-slate-650">🚫 Inscription annulée</p>
                                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                                  Cette inscription a été annulée. Veuillez contacter le secrétariat pour toute question.
                                </p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {sessionsHistory.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <EmptyState
                      title="Aucune formation enregistrée"
                      description="Vous n'êtes inscrit à aucune formation de CJ DTC pour le moment."
                    />
                  </div>
                )}
              </div>

              {/* Sessions ouvertes */}
              <div className="mt-12 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Sessions ouvertes</h3>
                  <p className="text-xs text-slate-500">
                    Découvrez les opportunités d'apprentissage ouvertes à l'inscription.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {availableSessions.map((session: any) => (
                    <div
                      key={session.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-l-4 border-l-[var(--cj-red)]"
                    >
                      <div>
                        {session.formationImageUrl ? (
                          <div className="relative h-44 overflow-hidden">
                            <img
                              src={session.formationImageUrl}
                              alt={session.formationTitle}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className={`relative h-44 bg-gradient-to-br ${getGradientForCategory(session.formationCategory)} flex items-center justify-center p-6 text-center text-white`}>
                            <div className="absolute inset-0 bg-black/10" />
                            <GraduationCap className="absolute top-4 right-4 w-10 h-10 text-white/20" />
                            <p className="relative font-extrabold text-sm tracking-wide line-clamp-3">
                              {session.formationTitle}
                            </p>
                          </div>
                        )}

                        <div className="p-5">
                          <span className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-50 text-[var(--cj-red)] border border-red-100">
                            {session.formationCategory || "Programme"}
                          </span>
                          
                          <h4 className="mt-3 text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                            {session.formationTitle}
                          </h4>
                          
                          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">Dates</span>
                              <span className="font-semibold text-slate-700">
                                {formatDateShort(session.startDate)} - {formatDateShort(session.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">Lieu / Format</span>
                              <span className="font-semibold text-slate-700">
                                {session.location} ({session.format})
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">Places restantes</span>
                              <span className="font-semibold text-slate-700">
                                {session.availableSpots} / {session.maxParticipants || 25}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 flex gap-2">
                        <Link
                          href={`/${locale}/formations/${session.formationSlug}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-2 text-xs font-semibold text-slate-700 hover:border-[var(--cj-blue)] hover:text-[var(--cj-blue)] transition text-center"
                        >
                          Voir les détails
                        </Link>
                        <Link
                          href={`/${locale}/espace-etudiants/confirm-inscription?formationId=${session.formationId}&sessionId=${session.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--cj-red)] py-2 text-xs font-semibold text-white hover:bg-[var(--cj-red-700)] transition text-center shadow-sm"
                        >
                          S'inscrire à cette session
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}

                  {availableSessions.length === 0 && (
                    <div className="col-span-full py-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                      <p className="text-xs text-slate-500">Aucune autre session ouverte disponible pour le moment.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRAVAUX (MY ASSIGNMENTS) */}
          {activeTab === "travaux" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Mes travaux</h3>
                  <p className="text-xs text-slate-500">
                    Retrouvez les travaux pratiques (TP), examens et projets assignés à vos formations.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {assignments.map((assign: any) => {
                  const status = getAssignmentStatus(assign);
                  const isFuture = new Date(assign.deadline).getTime() >= Date.now();
                  const borderL = 
                    status.theme === "green" ? "border-l-4 border-l-emerald-500" :
                    status.theme === "orange" ? "border-l-4 border-l-orange-500" :
                    "border-l-4 border-l-red-500";
                  
                  return (
                    <div
                      key={assign.id}
                      className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md ${borderL}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="space-y-1">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${status.color}`}>
                            {assign.type.toUpperCase()}
                          </span>
                          <h4 className="text-base font-bold text-slate-900">{assign.title}</h4>
                          <p className="text-xs text-slate-500">Formation : {assign.formation?.title}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${status.color} shadow-sm`}>
                            {status.label}
                          </span>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1">
                            Date limite : {formatDate(assign.deadline)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-6 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-700">Description :</p>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                            {assign.description}
                          </p>
                          
                          {/* Instructions attached (Télécharger les consignes) */}
                          <div className="mt-4">
                            <p className="text-xs font-semibold text-slate-700 mb-2">Consignes et documents de cours :</p>
                            {assign.files && assign.files.length > 0 ? (
                              <div className="space-y-1">
                                {assign.files.map((file: any) => (
                                  <a
                                    key={file.id}
                                    href={file.url}
                                    download={file.originalName}
                                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 underline font-medium"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    {file.originalName} ({Math.round(file.size / 1024)} KB)
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic font-medium">Aucun fichier de consigne attaché.</p>
                            )}
                          </div>

                          {/* Consignes text description */}
                          {assign.instructions && (
                            <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                              <p className="text-xs font-semibold text-slate-700 mb-1">Consignes / Instructions :</p>
                              <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{assign.instructions}</p>
                            </div>
                          )}
                        </div>

                        {/* Submissions section */}
                        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex flex-col justify-between">
                          <div>
                            <p className="text-xs font-semibold text-slate-700 mb-2">Votre dépôt :</p>
                            
                            {assign.submissions && assign.submissions.length > 0 ? (
                              <div className="space-y-3">
                                {assign.submissions.map((sub: any) => (
                                  <div key={sub.id} className="rounded-lg bg-white p-3 border border-slate-150 shadow-sm text-xs">
                                    <div className="flex justify-between font-semibold">
                                      <span className="text-slate-800">Soumission déposée</span>
                                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass(sub.status)}`}>
                                        {sub.status}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Déposé le {formatDateTime(sub.submittedAt)}</p>
                                    
                                    {sub.files && sub.files.length > 0 && (
                                      <div className="mt-2 space-y-1 pt-2 border-t border-slate-100">
                                        {sub.files.map((file: any) => (
                                          <a
                                            key={file.id}
                                            href={file.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-[10px] text-blue-600 hover:underline font-medium"
                                          >
                                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                                            {file.name}
                                          </a>
                                        ))}
                                      </div>
                                    )}

                                    {(sub.feedback || sub.reviewFeedback) && (
                                      <div className="mt-2 rounded-lg bg-blue-50/70 p-2.5 text-[10px] text-slate-700 border border-blue-100">
                                        <span className="font-bold text-[var(--cj-blue)]">Feedback Formateur :</span>{" "}
                                        {sub.feedback || sub.reviewFeedback}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">Aucun travail déposé pour le moment.</p>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-200">
                            {isFuture ? (
                              <button
                                onClick={() => setSelectedAssignmentForSubmission(assign)}
                                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--cj-blue)] py-2 text-xs font-semibold text-white hover:bg-[var(--cj-blue-700)] transition shadow-sm"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                Déposer mon travail
                              </button>
                            ) : (
                              <button
                                disabled
                                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-200 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
                              >
                                Dépôt verrouillé (date limite dépassée)
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {assignments.length === 0 && (
                  <div className="py-12 text-center">
                    <EmptyState
                      title="Aucun travail en attente"
                      description="L'administration n'a publié aucun TP ou examen pour vos formations."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACTUALITES (NEWS FEED) */}
          {activeTab === "news" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Actualités de CJ DTC</h3>
                <p className="text-xs text-slate-500">Restez informé des annonces administratives, événements et opportunités.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {news.map((item: any) => (
                  <div
                    key={item.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-l-4 border-l-indigo-500"
                  >
                    <div>
                      {item.imageData ? (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={item.imageData}
                            alt={item.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="relative h-48 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 flex items-center justify-center text-white">
                          <Newspaper className="w-12 h-12 text-indigo-300/80" />
                        </div>
                      )}

                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-bold text-indigo-500 uppercase tracking-wider">
                          <span>{item.category || "Général"}</span>
                          <span>{formatDateShort(item.createdAt)}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-[var(--cj-blue)] transition line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => setSelectedNewsForModal(item)}
                        className="w-full inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Lire la suite
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}

                {news.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <EmptyState
                      title="Aucune actualité"
                      description="Aucune publication récente de l'administration."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CALENDRIER (DEADLINES TIMELINE) */}
          {activeTab === "calendrier" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Calendrier des échéances</h3>
                <p className="text-xs text-slate-500">Planifiez vos travaux et consultez les dates clés de vos sessions.</p>
              </div>

              {calendarTimeline.length > 0 ? (
                <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8 py-4">
                  {calendarTimeline.map((evt, idx) => {
                    const EvtIcon = evt.icon;
                    return (
                      <div key={evt.id} className="relative group">
                        {/* Timeline point */}
                        <div className={`absolute -left-[37px] top-1 flex h-8 w-8 items-center justify-center rounded-full ${evt.color} text-white shadow ring-4 ring-white`}>
                          <EvtIcon className="h-4 w-4" />
                        </div>
                        
                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {evt.category}
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {formatDate(evt.date)}
                            </span>
                          </div>
                          
                          <h4 className="mt-2 text-sm font-bold text-slate-900 leading-snug">
                            {evt.title}
                          </h4>
                          
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            {evt.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <EmptyState
                    title="Calendrier vide"
                    description="Aucune échéance académique enregistrée."
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS (DETAILED NOTIFICATIONS FEED) */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Centre de notifications</h3>
                <p className="text-xs text-slate-500">Consultez l'historique complet des alertes administratives et pédagogiques.</p>
              </div>

              <div className="space-y-3">
                {notifications.map((noti: any) => {
                  const getNotificationColor = (type: string) => {
                    if (type === "reminder") return "border-l-4 border-l-red-500 bg-red-50/30";
                    if (type === "correction") return "border-l-4 border-l-emerald-500 bg-emerald-50/30";
                    return "border-l-4 border-l-blue-500 bg-blue-50/30";
                  };

                  return (
                    <div
                      key={noti.id}
                      className={`rounded-2xl border border-slate-100 p-5 shadow-sm ${getNotificationColor(noti.type)}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900">{noti.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{noti.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDateTime(noti.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {notifications.length === 0 && (
                  <div className="py-12 text-center">
                    <EmptyState
                      title="Aucune notification"
                      description="Votre boîte de réception est vide."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: SUPPORT & QUESTIONS */}
          {activeTab === "support" && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Question submission form */}
              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-white bg-white/60 p-6 shadow-sm sticky top-24">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Poser une question
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 leading-normal">
                    Nos secrétariats pédagogiques et administratifs s'engagent à vous répondre sous 24 à 48 heures ouvrées.
                  </p>

                  <form onSubmit={sendQuestion} className="space-y-4">
                    {questionError && (
                      <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                        {questionError}
                      </p>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Message *</label>
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={5}
                        required
                        placeholder="Rédigez clairement votre question pédagogique ou demande d'assistance..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-[var(--cj-blue)] focus:ring-4 focus:ring-blue-100 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={questionLoading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-blue)] py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--cj-blue-700)] disabled:opacity-50 shadow"
                    >
                      {questionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Soumettre ma question
                    </button>
                  </form>
                </div>
              </div>

              {/* Past questions with admin answers list */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Historique de vos échanges
                </h3>

                <div className="space-y-3">
                  {questions.map((item: any) => (
                    <div key={item.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                        <span className="text-[10px] font-bold text-[var(--cj-blue)] uppercase tracking-wider">
                          {item.formationTitle}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Posée le {formatDateTime(item.createdAt)}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800">Votre question :</p>
                          <p className="mt-1 text-slate-600 leading-relaxed">{item.message}</p>
                        </div>

                        {item.adminReply ? (
                          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs">
                            <div className="flex items-center justify-between font-semibold text-[var(--cj-blue)]">
                              <span>Réponse de l'administration</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {item.adminReplyAt ? formatDate(item.adminReplyAt) : ""}
                              </span>
                            </div>
                            <p className="mt-1.5 text-slate-700 leading-relaxed">
                              {item.adminReply}
                            </p>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full px-3 py-1 border border-amber-100">
                            <Clock3 className="w-3.5 h-3.5" />
                            En attente de réponse administrative
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {questions.length === 0 && (
                    <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                      <p className="text-xs text-slate-500 italic">Aucune question soumise pour le moment.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL DIALOG FOR SUBMITTING ASSIGNMENT */}
      {selectedAssignmentForSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[linear-gradient(120deg,#001737_0%,#002d72_52%,#0c4da2_100%)] px-6 py-5 text-white flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Téléverser mon fichier</p>
                <h3 className="text-sm font-bold mt-1 line-clamp-1">{selectedAssignmentForSubmission.title}</h3>
              </div>
              <button
                onClick={() => setSelectedAssignmentForSubmission(null)}
                className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAssignmentSubmit} className="p-6 space-y-4">
              {uploadErrorMessage && (
                <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                  {uploadErrorMessage}
                </p>
              )}
              {uploadSuccessMessage && (
                <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-600 border border-emerald-100">
                  {uploadSuccessMessage}
                </p>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Fichiers de rendu *
                </label>
                <input
                  type="file"
                  multiple
                  required
                  onChange={(e) => setUploadFiles(e.target.files)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-950 shadow-sm outline-none focus:border-[var(--cj-blue)] focus:ring-4 focus:ring-blue-100"
                />
                <p className="text-[10px] text-slate-400">
                  Taille max autorisée : {selectedAssignmentForSubmission.maxFileSize || 10} MB par fichier. <br />
                  Formats autorisés : {selectedAssignmentForSubmission.allowedFileTypes?.join(", ") || "pdf, doc, docx, zip"}.
                </p>
              </div>

              <div className="flex gap-2 pt-2 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAssignmentForSubmission(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWork}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--cj-blue)] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--cj-blue-700)] disabled:opacity-60 shadow"
                >
                  {isSubmittingWork ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  Déposer mon travail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG FOR FULL NEWS CONTENT */}
      {selectedNewsForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-60 overflow-hidden bg-slate-900 flex items-center justify-center text-white">
              {selectedNewsForModal.imageData ? (
                <img
                  src={selectedNewsForModal.imageData}
                  alt={selectedNewsForModal.title}
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <Newspaper className="w-16 h-16 text-slate-700" />
              )}
              <button
                onClick={() => setSelectedNewsForModal(null)}
                className="absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                <span>Catégorie : {selectedNewsForModal.category}</span>
                <span>Publié le {formatDate(selectedNewsForModal.createdAt)}</span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {selectedNewsForModal.title}
              </h3>
              
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedNewsForModal.content}
              </p>
            </div>

            <div className="bg-slate-50 p-4 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setSelectedNewsForModal(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Fermer la lecture
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function EspaceEtudiantsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <EspaceEtudiantsContent />
    </Suspense>
  );
}
