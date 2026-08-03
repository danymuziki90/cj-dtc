"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Award,
  CalendarDays,
  FileText,
  GraduationCap,
  Loader2,
  MapPinIcon,
  Phone,
} from "lucide-react";
import { StudentHeader } from "./_components/StudentHeader";
import { StudentHeroSection } from "./_components/StudentHeroSection";
import { StudentNavTabs } from "./_components/StudentNavTabs";
import { StudentStatsCards } from "./_components/StudentStatsCards";
import { OverviewTab } from "./_components/OverviewTab";
import { FormationsTab } from "./_components/FormationsTab";
import { AssignmentsTab } from "./_components/AssignmentsTab";
import { NewsTab } from "./_components/NewsTab";
import { CalendarTab } from "./_components/CalendarTab";
import { NotificationsTab } from "./_components/NotificationsTab";
import { SupportTab } from "./_components/SupportTab";
import { AssignmentSubmitModal, type UploadedFileData } from "./_components/AssignmentSubmitModal";
import { NewsModal } from "./_components/NewsModal";
import { DashboardPayload } from "./_components/types";
import { formatDate } from "./_components/utils";

function EspaceEtudiantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "fr";
  const localePrefix = locale ? `/${locale}` : "";

  const pendingFormationId = searchParams.get("formationId");
  const pendingSessionId = searchParams.get("sessionId");
  const pendingEnrollmentPath = pendingFormationId
    ? `${localePrefix}/espace-etudiants/confirm-inscription?formationId=${encodeURIComponent(
        pendingFormationId
      )}${pendingSessionId ? `&sessionId=${encodeURIComponent(pendingSessionId)}` : ""}`
    : "";

  // Auth & General State
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [heroData, setHeroData] = useState<any>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState("overview");

  // Support / Questions State
  const [question, setQuestion] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);

  // News Modal State
  const [selectedNewsForModal, setSelectedNewsForModal] = useState<any | null>(null);

  // Assignment submission states
  const [selectedAssignmentForSubmission, setSelectedAssignmentForSubmission] =
    useState<any | null>(null);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");

  async function loadDashboard(showSpinner = true) {
    if (showSpinner) setLoading(true);
    try {
      const response = await fetch(`/api/student/system/dashboard?t=${Date.now()}`, {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        setAuthError(
          payload.error ||
            "Vous devez vous connecter pour accéder à l'espace étudiant."
        );
        if (showSpinner) setLoading(false);
        return;
      }

      if (!response.ok) {
        setAuthError(payload.error || "Impossible de charger le dashboard.");
        if (showSpinner) setLoading(false);
        return;
      }

      setData(payload);
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setAuthError("Une erreur est survenue lors de la récupération des données.");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    
    fetch('/api/hero-images?pageKey=student_space')
      .then(res => res.json())
      .then(data => setHeroData(data))
      .catch(() => {});

    // ── Rafraîchissement périodique toutes les 30s (fallback si Supabase indisponible) ──
    const pollInterval = setInterval(() => loadDashboard(false), 30000);

    if (!supabase) return () => clearInterval(pollInterval);

    // Canal assignments (créés/modifiés par l'admin)
    const assignmentsChannel = supabase.channel("assignments_channel")
      .on("broadcast", { event: "assignment_created" }, () => loadDashboard(false))
      .on("broadcast", { event: "assignment_updated" }, () => loadDashboard(false))
      .on("broadcast", { event: "assignment_deleted" }, () => loadDashboard(false));

    // Canal submissions — deux noms de canaux possibles selon la route utilisée
    const submissionsChannel = supabase.channel("submissions_channel")
      .on("broadcast", { event: "submission_created" }, () => loadDashboard(false))
      .on("broadcast", { event: "submission_graded"  }, () => loadDashboard(false))
      .on("broadcast", { event: "submission_updated" }, () => loadDashboard(false));

    // Canal travaux — utilisé par /api/student/submit et /api/admin/travaux
    const travauxChannel = supabase.channel("submissions_travaux_channel")
      .on("broadcast", { event: "submission_created" }, () => loadDashboard(false))
      .on("broadcast", { event: "submission_graded"  }, () => loadDashboard(false))
      .on("broadcast", { event: "submission_returned"}, () => loadDashboard(false))
      .on("broadcast", { event: "submission_updated" }, () => loadDashboard(false));

    assignmentsChannel.subscribe();
    submissionsChannel.subscribe();
    travauxChannel.subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase?.removeChannel(assignmentsChannel);
      supabase?.removeChannel(submissionsChannel);
      supabase?.removeChannel(travauxChannel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global variables extracted from data payload
  const student = data?.student || {};
  const dashboard = data?.dashboard || {};
  const progress = dashboard.progress || {};
  const notifications = dashboard.notifications || [];
  const questions = dashboard.questions || [];
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
  }, [data, progress]);

  const activeSessionsCount = useMemo(() => {
    return sessionsHistory.filter((s: any) => s.sessionLifecycle === "active")
      .length;
  }, [sessionsHistory]);

  const pendingAssignmentsCount = useMemo(() => {
    return assignments.filter((assign: any) => {
      const hasSub = assign.submissions && assign.submissions.length > 0;
      const isFuture = new Date(assign.deadline).getTime() >= Date.now();
      return !hasSub && isFuture;
    }).length;
  }, [assignments]);

  const submittedAssignmentsCount = useMemo(() => {
    return assignments.filter((assign: any) => {
      const hasSub = assign.submissions && assign.submissions.length > 0;
      if (!hasSub) return false;
      const isEvaluated = assign.submissions?.some(
        (sub: any) => sub.status === "graded" || sub.status === "returned" || sub.grade != null
      );
      return !isEvaluated;
    }).length;
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

  async function handleAssignmentSubmit(uploadedFiles: UploadedFileData[]) {
    if (
      !selectedAssignmentForSubmission ||
      !uploadedFiles ||
      uploadedFiles.length === 0
    ) {
      setUploadErrorMessage("Veuillez téléverser au moins un fichier avant de valider.");
      return;
    }

    setIsSubmittingWork(true);
    setUploadErrorMessage("");
    setUploadSuccessMessage("");

    try {
      // ── Vérification auth (non bloquante — on tente quand même) ────────
      const authCheck = await fetch("/api/student/auth/check", {
        credentials: "include",
        cache: "no-store",
      }).then(r => r.json()).catch(() => null);

      console.log("[handleAssignmentSubmit] authCheck:", authCheck);

      // Récupérer l'email et l'ID étudiant depuis l'état du dashboard
      // pour les envoyer comme fallback d'identification
      const studentEmail = (student as any)?.email || null;
      const studentId    = (student as any)?.id    || null;

      // ── POST vers la nouvelle route robuste ───────────────────────────
      const response = await fetch("/api/student/submit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignmentForSubmission.id,
          files: uploadedFiles,
          // Fallback d'identification si le cookie JWT est invalide
          studentEmail,
          studentId,
        }),
      });

      let resData: any = {};
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        resData = await response.json().catch(() => ({}));
      } else {
        resData = {
          error: `Erreur serveur HTTP ${response.status}. Veuillez réessayer.`,
        };
      }

      console.log("[handleAssignmentSubmit] response:", response.status, resData);

      if (!response.ok) {
        throw new Error(
          resData.message ||
            resData.error ||
            `Échec de l'envoi (HTTP ${response.status}).`
        );
      }

      setUploadSuccessMessage("Votre travail a été déposé avec succès !");
      await loadDashboard();

      setTimeout(() => {
        setSelectedAssignmentForSubmission(null);
        setUploadSuccessMessage("");
      }, 2000);
    } catch (err: any) {
      console.error("[handleAssignmentSubmit] Error:", err);
      setUploadErrorMessage(
        err.message || "Erreur lors de l'enregistrement de votre travail."
      );
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
      const isClose =
        new Date(assign.deadline).getTime() - Date.now() <
        3 * 24 * 60 * 60 * 1000;

      let evtColor = "bg-orange-500";
      if (hasSub) evtColor = "bg-emerald-500";
      else if (isPast || isClose) evtColor = "bg-red-500";

      events.push({
        id: `assign-${assign.id}`,
        date: new Date(assign.deadline),
        title: `Date limite de rendu : ${assign.title}`,
        description: `Devoir de type "${assign.type.toUpperCase()}" pour la formation ${
          assign.formation?.title
        }`,
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
          description: `Format : ${session.format || "En ligne"} | Lieu : ${
            session.location || "DTC Central"
          }`,
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#041224_0%,#002d72_45%,#eef5ff_100%)] px-4">
        <div className="w-full max-w-md rounded-[30px] border border-white/20 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
            Espace Étudiant
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
            <h1 className="text-xl font-semibold">
              Chargement de la plateforme...
            </h1>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/80">
            Nous préparons vos cours, vos travaux et vos actualités dans votre
            tableau de bord CJ DTC.
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
            <h1 className="mt-4 text-3xl font-semibold">Connexion requise</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
              Veuillez vous authentifier pour accéder à vos cours, travaux et
              documents pédagogiques.
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
        ? `${formatDate(currentSession.startDate)} - ${formatDate(
            currentSession.endDate
          )}`
        : "Pas de session active",
    },
    {
      icon: MapPinIcon,
      label: "Lieu / Format",
      value: currentSession
        ? [currentSession.location, currentSession.format]
            .filter(Boolean)
            .join(" | ")
        : "Session à venir",
    },
    {
      icon: Phone,
      label: "Contact WhatsApp",
      value: student.whatsapp || "Non renseigné",
    },
  ];

  const basePath = `${localePrefix}/espace-etudiants`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-800">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#020617_0%,#0b1629_18%,#f1f5f9_58%,#f8fafc_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top_left,rgba(12,77,162,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(227,6,19,0.12),transparent_25%)]" />

      {/* Modern top header */}
      <StudentHeader
        student={student}
        studentInitial={studentInitial}
        basePath={basePath}
        pendingAssignmentsCount={pendingAssignmentsCount}
        onLogout={logout}
      />

      <main className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* SECTION 1: HERO */}
        <StudentHeroSection
          student={student}
          currentSession={currentSession}
          heroSummary={heroSummary}
          heroStats={heroStats}
          eligibility={eligibility}
          firstCertificate={firstCertificate}
          basePath={basePath}
          heroData={heroData}
        />

        {/* NAVIGATION TABS */}
        <StudentNavTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalFormationsCount={totalFormationsCount}
          pendingAssignmentsCount={pendingAssignmentsCount}
          newsCount={news.length}
          totalNotifications={totalNotifications}
          locale={locale}
        />

        {/* SECTION 2: STATS CARD ROW */}
        <StudentStatsCards
          totalFormationsCount={totalFormationsCount}
          activeSessionsCount={activeSessionsCount}
          pendingAssignmentsCount={pendingAssignmentsCount}
          submittedAssignmentsCount={submittedAssignmentsCount}
          newsCount={news.length}
          locale={locale}
        />

        {/* DYNAMIC CONTENT CONTAINER BASED ON TAB */}
        <div className="space-y-8">
          {activeTab === "overview" && (
            <OverviewTab
              currentSession={currentSession}
              assignments={assignments}
              news={news}
              notifications={notifications}
              setActiveTab={setActiveTab}
              setSelectedAssignmentForSubmission={
                setSelectedAssignmentForSubmission
              }
              setSelectedNewsForModal={setSelectedNewsForModal}
              sendQuestion={sendQuestion}
              question={question}
              setQuestion={setQuestion}
              questionError={questionError}
              questionLoading={questionLoading}
              locale={locale}
            />
          )}

          {activeTab === "formations" && (
            <FormationsTab
              sessionsHistory={sessionsHistory}
              availableSessions={availableSessions}
              completionRate={completionRate}
              setActiveTab={setActiveTab}
              basePath={basePath}
              locale={locale}
            />
          )}

          {activeTab === "travaux" && (
            <AssignmentsTab
              assignments={assignments}
              setSelectedAssignmentForSubmission={setSelectedAssignmentForSubmission}
            />
          )}

          {activeTab === "news" && (
            <NewsTab
              news={news}
              setSelectedNewsForModal={setSelectedNewsForModal}
            />
          )}

          {activeTab === "calendrier" && (
            <CalendarTab calendarTimeline={calendarTimeline} />
          )}

          {activeTab === "notifications" && (
            <NotificationsTab notifications={notifications} />
          )}

          {activeTab === "support" && (
            <SupportTab
              questions={questions}
              sendQuestion={sendQuestion}
              question={question}
              setQuestion={setQuestion}
              questionError={questionError}
              questionLoading={questionLoading}
            />
          )}
        </div>
      </main>

      {/* MODALS */}
      <AssignmentSubmitModal
        selectedAssignment={selectedAssignmentForSubmission}
        onClose={() => {
          setSelectedAssignmentForSubmission(null);
          setUploadErrorMessage("");
          setUploadSuccessMessage("");
        }}
        onSubmit={handleAssignmentSubmit}
        uploadErrorMessage={uploadErrorMessage}
        uploadSuccessMessage={uploadSuccessMessage}
        isSubmittingWork={isSubmittingWork}
        studentId={(student as any)?.id}
        studentEmail={(student as any)?.email}
      />

      <NewsModal
        selectedNews={selectedNewsForModal}
        onClose={() => setSelectedNewsForModal(null)}
      />
    </div>
  );
}

export default function EspaceEtudiantsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      }
    >
      <EspaceEtudiantsContent />
    </Suspense>
  );
}
