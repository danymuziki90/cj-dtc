import { Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { studentStatusClass } from "@/components/ui/student-space";

export function statusClass(value: string) {
  return studentStatusClass(value);
}

export function translateEnrollmentStatus(status: string) {
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

export function lifecycleLabel(value?: string | null) {
  if (value === "upcoming") return "À venir";
  if (value === "active") return "Active";
  if (value === "completed") return "Terminée";
  return "Inconnu";
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString("fr-FR") : "-";
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function getGradientForCategory(category: string | null) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("rh") || cat.includes("ressources")) return "from-blue-600 to-indigo-900";
  if (cat.includes("lead") || cat.includes("manag")) return "from-violet-600 to-indigo-950";
  if (cat.includes("marketing") || cat.includes("digi")) return "from-rose-600 to-red-950";
  return "from-slate-700 via-slate-800 to-slate-900";
}

export function getAssignmentStatus(assign: any) {
  const submission = assign.submissions?.[0] || assign.Submission?.[0];
  const corrStatus = submission?.correctionStatus;
  const isGraded = corrStatus === "graded" || corrStatus === "validated" || submission?.status === "graded" || submission?.grade != null;
  const isReturned = corrStatus === "returned" || submission?.status === "returned";
  const isInReview = corrStatus === "in_review";

  if (isGraded) {
    return { 
      status: "graded",
      label: corrStatus === "validated" ? "Validé" : "Corrigé", 
      color: "border-blue-200 bg-blue-50 text-blue-800",
      className: "border-blue-200 bg-blue-50 text-blue-800",
      theme: "blue",
      icon: CheckCircle2
    };
  }

  if (isReturned) {
    return { 
      status: "returned",
      label: "À réviser", 
      color: "border-amber-200 bg-amber-50 text-amber-800",
      className: "border-amber-200 bg-amber-50 text-amber-800",
      theme: "amber",
      icon: Clock
    };
  }

  if (isInReview) {
    return { 
      status: "submitted",
      label: "En correction", 
      color: "border-purple-200 bg-purple-50 text-purple-800",
      className: "border-purple-200 bg-purple-50 text-purple-800",
      theme: "purple",
      icon: CheckCircle2
    };
  }

  const hasSub = assign.submissions && assign.submissions.length > 0;
  if (hasSub) {
    return { 
      status: "submitted",
      label: "Déposé", 
      color: "border-emerald-200 bg-emerald-50 text-emerald-800",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
      theme: "green",
      icon: CheckCircle2
    };
  }

  const deadlineTime = new Date(assign.deadline).getTime();
  const isPast = deadlineTime < Date.now();
  if (isPast) {
    return { 
      status: "late",
      label: "En retard", 
      color: "border-red-200 bg-red-50 text-red-800",
      className: "border-red-200 bg-red-50 text-red-800",
      theme: "red",
      icon: AlertCircle
    };
  }

  const isClose = (deadlineTime - Date.now()) < 3 * 24 * 60 * 60 * 1000;
  if (isClose) {
    return { 
      status: "pending",
      label: "À remettre", 
      color: "border-red-200 bg-red-50 text-red-800",
      className: "border-red-200 bg-red-50 text-red-800",
      theme: "red",
      icon: Clock
    };
  }

  return { 
    status: "pending",
    label: "En cours", 
    color: "border-orange-200 bg-orange-50 text-orange-800",
    className: "border-orange-200 bg-orange-50 text-orange-800",
    theme: "orange",
    icon: Activity
  };
}
