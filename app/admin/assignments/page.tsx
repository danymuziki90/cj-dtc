"use client";

import { useState, useEffect, useMemo } from "react";
import { useToastNotification } from "@/components/ui/toast";
import {
  FileText,
  Calendar,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit3,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Layers,
  Sparkles,
  ExternalLink,
  GraduationCap,
  Paperclip,
} from "lucide-react";

interface AssignmentFile {
  id?: number;
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
  studentEmail: string;
  studentName?: string;
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
  instructions: string | null;
  type: "tp" | "exam" | "project";
  difficulty: "debutant" | "intermediaire" | "avance";
  formationId: number;
  formation: {
    id: number;
    title: string;
    slug?: string;
  };
  sessionId: number | null;
  session: {
    id: number;
    startDate: string;
    endDate: string;
    status?: string;
  } | null;
  deadline: string;
  publishDate: string;
  status: "brouillon" | "publie" | "archive";
  maxFileSize: number;
  allowedFileTypes: string[];
  createdBy: string | null;
  createdAt: string;
  submissions: Submission[];
  files: AssignmentFile[];
}

interface FormationOption {
  id: number;
  title: string;
  statut?: string;
}

interface SessionOption {
  id: number;
  formationId: number;
  startDate: string;
  endDate: string;
  status: string;
  format?: string;
}

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [formations, setFormations] = useState<FormationOption[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Recherche & Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  // Modale Formulaire Devoir (Création & Édition)
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [submittingDevoir, setSubmittingDevoir] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    objectives: "",
    instructions: "",
    type: "tp" as "tp" | "exam" | "project",
    difficulty: "debutant" as "debutant" | "intermediaire" | "avance",
    formationId: 0,
    sessionId: 0,
    publishDate: "",
    deadline: "",
    status: "publie" as "brouillon" | "publie" | "archive",
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "doc", "docx", "zip"],
  });

  // Fichiers joints consignes
  const [existingFiles, setExistingFiles] = useState<AssignmentFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [pendingUploadFiles, setPendingUploadFiles] = useState<File[]>([]);

  // Correction & Notation
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);
  const [enrollmentsList, setEnrollmentsList] = useState<Array<{ email: string; name: string }>>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Formulaire de notation
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [gradeValue, setGradeValue] = useState<string>("");
  const [feedbackValue, setFeedbackValue] = useState<string>("");
  const [savingGrade, setSavingGrade] = useState(false);

  const { success, error } = useToastNotification() || {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg),
  };

  useEffect(() => {
    fetchAssignments();
    fetchFormations();
    fetchSessions();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/assignments");
      if (!response.ok) throw new Error("Erreur de récupération");
      const data = await response.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      error("Impossible de récupérer les devoirs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFormations = async () => {
    try {
      const response = await fetch("/api/formations");
      const data = await response.json();
      const nextFormations = Array.isArray(data) ? data : [];
      setFormations(nextFormations);
    } catch (err) {
      console.error("Erreur chargement formations:", err);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      const data = await response.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement sessions:", err);
    }
  };

  // Sessions ouvertes filtrées par formation sélectionnée
  const filteredSessions = useMemo(() => {
    if (!formData.formationId) return [];
    return sessions.filter(
      (s) => s.formationId === formData.formationId && s.status === "ouverte"
    );
  }, [sessions, formData.formationId]);

  // Ouverture modale Création
  const handleOpenCreateModal = () => {
    setEditingAssignment(null);
    setExistingFiles([]);
    setPendingUploadFiles([]);
    
    // Par défaut, première formation si disponible
    const firstFormationId = formations[0]?.id || 0;
    const defaultPublishDate = new Date().toISOString().slice(0, 16);
    const defaultDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

    setFormData({
      title: "",
      description: "",
      objectives: "",
      instructions: "",
      type: "tp",
      difficulty: "debutant",
      formationId: firstFormationId,
      sessionId: 0,
      publishDate: defaultPublishDate,
      deadline: defaultDeadline,
      status: "publie",
      maxFileSize: 10,
      allowedFileTypes: ["pdf", "doc", "docx", "zip"],
    });

    setShowModal(true);
  };

  // Ouverture modale Édition
  const handleOpenEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setExistingFiles(assignment.files || []);
    setPendingUploadFiles([]);

    const pubDateStr = assignment.publishDate
      ? new Date(assignment.publishDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);

    const deadlineStr = assignment.deadline
      ? new Date(assignment.deadline).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);

    setFormData({
      title: assignment.title || "",
      description: assignment.description || "",
      objectives: assignment.objectives || "",
      instructions: assignment.instructions || "",
      type: assignment.type || "tp",
      difficulty: assignment.difficulty || "debutant",
      formationId: assignment.formationId || 0,
      sessionId: assignment.sessionId || 0,
      publishDate: pubDateStr,
      deadline: deadlineStr,
      status: assignment.status || "publie",
      maxFileSize: assignment.maxFileSize || 10,
      allowedFileTypes: assignment.allowedFileTypes || ["pdf", "doc", "docx", "zip"],
    });

    setShowModal(true);
  };

  // Téléversement d'un fichier joint consignes vers Cloudflare R2
  const handleUploadFileToR2 = async (file: File): Promise<AssignmentFile | null> => {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/admin/assignments/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Échec du téléversement R2.");
      }

      const fileData = await res.json();
      return {
        name: fileData.name,
        originalName: fileData.originalName,
        size: fileData.size,
        url: fileData.url,
      };
    } catch (err: any) {
      console.error(err);
      error(`Erreur d'envoi R2 (${file.name}) : ${err.message}`);
      return null;
    }
  };

  // Soumission Formulaire (Créer / Modifier)
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      error("Veuillez saisir un titre pour le travail.");
      return;
    }

    if (!formData.formationId) {
      error("Veuillez sélectionner une formation.");
      return;
    }

    setSubmittingDevoir(true);

    try {
      // 1. Upload des nouveaux fichiers joints vers R2
      const newlyUploaded: AssignmentFile[] = [];
      if (pendingUploadFiles.length > 0) {
        setUploadingFiles(true);
        for (const file of pendingUploadFiles) {
          const uploaded = await handleUploadFileToR2(file);
          if (uploaded) {
            newlyUploaded.push(uploaded);
          }
        }
        setUploadingFiles(false);
      }

      const allFilesPayload = [...existingFiles, ...newlyUploaded];

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        objectives: formData.objectives.trim() || null,
        instructions: formData.instructions.trim() || null,
        type: formData.type,
        difficulty: formData.difficulty,
        formationId: Number(formData.formationId),
        sessionId: formData.sessionId ? Number(formData.sessionId) : null,
        publishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : new Date().toISOString(),
        deadline: new Date(formData.deadline).toISOString(),
        status: formData.status,
        maxFileSize: Number(formData.maxFileSize) || 10,
        allowedFileTypes: formData.allowedFileTypes,
        files: allFilesPayload.map((f) => ({
          name: f.name,
          originalName: f.originalName,
          size: f.size,
          url: f.url,
        })),
      };

      let response;
      if (editingAssignment) {
        // Édition
        response = await fetch(`/api/admin/assignments/${editingAssignment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Création
        response = await fetch("/api/admin/assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const resErr = await response.json();
        throw new Error(resErr.error || "Erreur lors de l'enregistrement.");
      }

      const savedAssignment = await response.json();

      if (editingAssignment) {
        setAssignments((prev) =>
          prev.map((a) => (a.id === editingAssignment.id ? savedAssignment : a))
        );
        success("Travail mis à jour avec succès !");
      } else {
        setAssignments((prev) => [savedAssignment, ...prev]);
        success("Nouveau travail créé et synchronisé avec succès !");
      }

      setShowModal(false);
    } catch (err: any) {
      console.error(err);
      error(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSubmittingDevoir(false);
      setUploadingFiles(false);
    }
  };

  // Suppression
  const handleDeleteAssignment = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce devoir ? Cette action est irréversible.")) return;

    try {
      const response = await fetch(`/api/admin/assignments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur de suppression");

      setAssignments((prev) => prev.filter((a) => a.id !== id));
      if (selectedAssignment?.id === id) {
        setSelectedAssignment(null);
      }
      success("Travail supprimé avec succès.");
    } catch (err) {
      console.error(err);
      error("Erreur lors de la suppression.");
    }
  };

  // Ouvrir le panneau de correction pour un devoir
  const handleOpenCorrection = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setActiveSubmission(null);
    setSubmissionsList([]);
    setEnrollmentsList([]);
    setLoadingSubmissions(true);

    try {
      const response = await fetch(`/api/admin/assignments/${assignment.id}/submissions`);
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setSubmissionsList(data.submissions || []);
      setEnrollmentsList(data.enrollments || []);
    } catch (err) {
      console.error(err);
      error("Impossible de charger les devoirs rendus.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Enregistrer la note
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !activeSubmission) return;

    setSavingGrade(true);

    try {
      const grade = gradeValue !== "" ? parseFloat(gradeValue) : null;
      const status = grade !== null ? "graded" : "submitted";

      const payload = {
        submissionId: activeSubmission.id,
        studentEmail: activeSubmission.studentEmail,
        status: status,
        grade: grade,
        feedback: feedbackValue.trim() || null,
      };

      const response = await fetch(
        `/api/admin/assignments/${selectedAssignment.id}/submissions`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Erreur de sauvegarde");
      const updated = await response.json();

      setSubmissionsList((prev) =>
        prev.map((sub) => (sub.id === activeSubmission.id ? { ...sub, ...updated } : sub))
      );

      setAssignments((prev) =>
        prev.map((a) => {
          if (a.id === selectedAssignment.id) {
            return {
              ...a,
              submissions: a.submissions.map((s) =>
                s.studentEmail.toLowerCase() === activeSubmission.studentEmail.toLowerCase()
                  ? { ...s, ...updated }
                  : s
              ),
            };
          }
          return a;
        })
      );

      setActiveSubmission(null);
      setGradeValue("");
      setFeedbackValue("");
      success("Note et commentaires enregistrés !");
    } catch (err) {
      console.error(err);
      error("Erreur lors de la sauvegarde.");
    } finally {
      setSavingGrade(false);
    }
  };

  // Demander une correction ("À refaire")
  const handleRequestRevision = async (sub: Submission) => {
    if (!selectedAssignment) return;
    const feedback = prompt("Raison ou consignes de modification pour l'étudiant :");
    if (feedback === null) return;

    try {
      const payload = {
        submissionId: sub.id,
        studentEmail: sub.studentEmail,
        status: "returned",
        grade: null,
        feedback: feedback.trim() || "Consigne de modification demandée par le formateur.",
      };

      const response = await fetch(
        `/api/admin/assignments/${selectedAssignment.id}/submissions`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Erreur");
      const updated = await response.json();

      setSubmissionsList((prev) =>
        prev.map((item) => (item.id === sub.id ? { ...item, ...updated } : item))
      );

      success("Demande de modification transmise à l'étudiant.");
    } catch (err) {
      console.error(err);
      error("Erreur lors de la demande de révision.");
    }
  };

  // Devoirs filtrés
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      // Recherche textuelle
      const query = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.formation.title.toLowerCase().includes(query);

      // Statut
      const matchStatus = statusFilter === "all" || a.status === statusFilter;

      // Type
      const matchType = typeFilter === "all" || a.type === typeFilter;

      // Difficulté
      const matchDifficulty = difficultyFilter === "all" || a.difficulty === difficultyFilter;

      return matchSearch && matchStatus && matchType && matchDifficulty;
    });
  }, [assignments, searchTerm, statusFilter, typeFilter, difficultyFilter]);

  // Helpers pour les badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "publie":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Publié
          </span>
        );
      case "brouillon":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" />
            Brouillon
          </span>
        );
      case "archive":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
            <Layers className="w-3 h-3 text-slate-500" />
            Archivé
          </span>
        );
      default:
        return null;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "debutant":
        return (
          <span className="inline-flex items-center text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            Débutant
          </span>
        );
      case "intermediaire":
        return (
          <span className="inline-flex items-center text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
            Intermédiaire
          </span>
        );
      case "avance":
        return (
          <span className="inline-flex items-center text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
            Avancé
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-700 bg-clip-text text-transparent">
            Gestion des Travaux & TP
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pilotez les sujets de TP, projets et examens, gérez les consignes R2 et notez les rendus étudiants.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nouveau travail
        </button>
      </div>

      {/* Barre de Recherche & Filtres */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Recherche textuelle */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, formation ou mot clé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
          />
        </div>

        {/* Filtres Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-900/20"
          >
            <option value="all">Tous les statuts</option>
            <option value="publie">Publié</option>
            <option value="brouillon">Brouillon</option>
            <option value="archive">Archivé</option>
          </select>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-900/20"
          >
            <option value="all">Tous les types</option>
            <option value="tp">TP (Travail Pratique)</option>
            <option value="exam">Examen</option>
            <option value="project">Projet</option>
          </select>

          {/* Difficulté */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-900/20"
          >
            <option value="all">Toutes difficultés</option>
            <option value="debutant">Débutant</option>
            <option value="intermediaire">Intermédiaire</option>
            <option value="avance">Avancé</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des devoirs */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-xs text-slate-500">
              Chargement des travaux et TP...
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Aucun travail trouvé</p>
              <p className="text-xs text-slate-400">
                Ajustez vos filtres ou créez votre premier sujet de TP.
              </p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const overdue = new Date(assignment.deadline) < new Date();
              const isSelected = selectedAssignment?.id === assignment.id;

              return (
                <div
                  key={assignment.id}
                  onClick={() => handleOpenCorrection(assignment)}
                  className={`bg-white border rounded-3xl p-6 shadow-sm transition hover:shadow-md cursor-pointer ${
                    isSelected
                      ? "border-blue-900 ring-2 ring-blue-900/10 bg-blue-50/10"
                      : "border-slate-200/80"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {assignment.type === "tp"
                            ? "TP"
                            : assignment.type === "exam"
                            ? "Examen"
                            : "Projet"}
                        </span>
                        {getStatusBadge(assignment.status)}
                        {getDifficultyBadge(assignment.difficulty)}
                        <span className="text-xs text-slate-500 font-medium">
                          • {assignment.formation.title}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 mt-2">
                        {assignment.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEditModal(assignment)}
                        title="Éditer le travail"
                        className="p-2 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        title="Supprimer le travail"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-650 mt-2 line-clamp-2 leading-relaxed">
                    {assignment.description}
                  </p>

                  {/* Objectifs s'il y en a */}
                  {assignment.objectives && (
                    <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                      <strong>🎯 Objectifs :</strong> {assignment.objectives}
                    </p>
                  )}

                  {/* Fichiers joints consignes */}
                  {assignment.files && assignment.files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {assignment.files.map((file) => (
                        <a
                          key={file.id || file.url}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-slate-700 hover:bg-slate-100 font-medium transition"
                        >
                          <Paperclip className="w-3 h-3 text-blue-900" />
                          Consigne: {file.originalName}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Footer infos */}
                  <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 gap-2">
                    <span className={overdue ? "text-rose-600 font-bold flex items-center gap-1" : "flex items-center gap-1"}>
                      <Calendar className="w-3 h-3" />
                      Limite: {new Date(assignment.deadline).toLocaleString("fr-FR")}
                    </span>

                    {assignment.session ? (
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                        Session #{assignment.session.id} (du {new Date(assignment.session.startDate).toLocaleDateString("fr-FR")})
                      </span>
                    ) : (
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium">
                        Toutes les sessions
                      </span>
                    )}

                    <span className="font-bold text-blue-950 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      {assignment.submissions?.length || 0} rendu(s)
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panneau latéral : Notation & Suivi des rendus */}
        <div className="lg:col-span-1">
          {selectedAssignment ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm sticky top-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Rendus & Evaluation
                </h3>
                <p className="text-xs font-semibold text-blue-950 mt-2 line-clamp-1">
                  {selectedAssignment.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {selectedAssignment.formation.title}
                </p>
              </div>

              {loadingSubmissions ? (
                <div className="text-center text-xs text-slate-500 py-6">
                  Chargement des rendus étudiants...
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Formulaire de notation actif */}
                  {activeSubmission && (
                    <form
                      onSubmit={handleSaveGrade}
                      className="bg-blue-50/40 border border-blue-200/80 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-950">
                          Noter {activeSubmission.studentName || activeSubmission.studentEmail}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveSubmission(null)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase">
                          Note (sur 20) *
                        </label>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max="20"
                          required
                          value={gradeValue}
                          onChange={(e) => setGradeValue(e.target.value)}
                          placeholder="Ex: 16.5"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-950 outline-none focus:ring-2 focus:ring-blue-900/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase">
                          Appréciation / Correction
                        </label>
                        <textarea
                          value={feedbackValue}
                          onChange={(e) => setFeedbackValue(e.target.value)}
                          placeholder="Remarques pédagogiques et conseils..."
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-950 outline-none focus:ring-2 focus:ring-blue-900/20"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingGrade}
                        className="w-full flex items-center justify-center py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Enregistrer la note
                      </button>
                    </form>
                  )}

                  {/* Liste des étudiants inscrits à la session */}
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    <span className="block text-xs font-bold text-slate-700 uppercase">
                      Inscrits concernés ({enrollmentsList.length}) :
                    </span>

                    {enrollmentsList.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Aucun étudiant inscrit trouvé.</p>
                    ) : (
                      enrollmentsList.map((enrollment) => {
                        const submission = submissionsList.find(
                          (s) => s.studentEmail.toLowerCase() === enrollment.email.toLowerCase()
                        );

                        return (
                          <div
                            key={enrollment.email}
                            className="border border-slate-200/80 rounded-2xl p-3 space-y-2 hover:bg-slate-50/60 transition"
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <h4 className="font-bold text-xs text-slate-900">
                                  {enrollment.name}
                                </h4>
                                <p className="text-[9px] text-slate-400">{enrollment.email}</p>
                              </div>

                              {submission ? (
                                submission.status === "graded" ? (
                                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Noté: {submission.grade}/20
                                  </span>
                                ) : submission.status === "returned" ? (
                                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    À refaire
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                    Rendu
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500">
                                  Non rendu
                                </span>
                              )}
                            </div>

                            {/* Fichiers rendus par l'étudiant */}
                            {submission && (
                              <div className="space-y-1.5 pt-1">
                                <div className="flex flex-wrap gap-1">
                                  {submission.files.map((file) => (
                                    <a
                                      key={file.id}
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-[9px] font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                      <Download className="w-2.5 h-2.5 text-blue-900" />
                                      {file.originalName}
                                    </a>
                                  ))}
                                </div>

                                {/* Actions sur le rendu */}
                                <div className="flex gap-1.5 pt-1.5 border-t border-slate-100">
                                  <button
                                    onClick={() => {
                                      setActiveSubmission(submission);
                                      setGradeValue(submission.grade !== null ? String(submission.grade) : "");
                                      setFeedbackValue(submission.feedback || "");
                                    }}
                                    className="flex-1 py-1 bg-blue-950 hover:bg-blue-900 text-white font-bold text-[9px] rounded-lg text-center transition"
                                  >
                                    Noter
                                  </button>
                                  <button
                                    onClick={() => handleRequestRevision(submission)}
                                    className="flex-1 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-bold text-[9px] rounded-lg text-center transition border border-slate-200"
                                  >
                                    À refaire
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 border-dashed rounded-3xl p-12 text-center space-y-2 text-slate-400 shadow-sm sticky top-6">
              <GraduationCap className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Aucun travail sélectionné</p>
              <p className="text-[11px]">
                Cliquez sur un travail pour consulter les rendus des étudiants et les noter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODALE DE CREATION & EDITITION */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    {editingAssignment ? "Modifier le travail" : "Nouveau travail (TP / Projet / Examen)"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Renseignez les détails pédagogiques, la formation et la session associée.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitAssignment} className="space-y-5">
                {/* Titre */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Titre du travail *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: TP 1 - Configuration d'une architecture réseau sécurisée"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/20 outline-none text-xs font-medium"
                    required
                  />
                </div>

                {/* Description Détaillée */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description détaillée *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Présentation générale du sujet, contexte et livrables attendus..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/20 outline-none text-xs"
                    required
                  />
                </div>

                {/* Objectifs pédagogiques */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Objectifs pédagogiques (Optionnel)
                  </label>
                  <textarea
                    value={formData.objectives}
                    onChange={(e) => setFormData((prev) => ({ ...prev, objectives: e.target.value }))}
                    rows={2}
                    placeholder="Acquérir les compétences de diagnostic, maîtriser les commandes de routage..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/20 outline-none text-xs"
                  />
                </div>

                {/* Selection Formation & Session */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Formation (Dynamique Supabase) *
                    </label>
                    <select
                      value={formData.formationId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          formationId: Number(e.target.value),
                          sessionId: 0, // Réinitialiser session si formation change
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/20 outline-none text-xs font-semibold text-slate-900"
                      required
                    >
                      <option value={0} disabled>
                        Sélectionnez une formation disponible...
                      </option>
                      {formations.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Session concernée (Filtre Ouvertes)
                    </label>
                    <select
                      value={formData.sessionId}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, sessionId: Number(e.target.value) }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/20 outline-none text-xs font-medium"
                    >
                      <option value={0}>Toutes les sessions de cette formation</option>
                      {filteredSessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          Session #{s.id} (du {new Date(s.startDate).toLocaleDateString("fr-FR")})
                        </option>
                      ))}
                    </select>
                    {formData.formationId > 0 && filteredSessions.length === 0 && (
                      <p className="text-[10px] text-amber-600 mt-1">
                        Aucune session ouverte pour cette formation (le travail sera associé à toute la formation).
                      </p>
                    )}
                  </div>
                </div>

                {/* Type, Difficulté, Statut */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Type de travail *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, type: e.target.value as any }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/20 outline-none text-xs"
                      required
                    >
                      <option value="tp">Travail Pratique (TP)</option>
                      <option value="exam">Examen</option>
                      <option value="project">Projet de fin de module</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Niveau de difficulté *
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, difficulty: e.target.value as any }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/20 outline-none text-xs"
                      required
                    >
                      <option value="debutant">Débutant</option>
                      <option value="intermediaire">Intermédiaire</option>
                      <option value="avance">Avancé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Statut de publication *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, status: e.target.value as any }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/20 outline-none text-xs font-semibold"
                      required
                    >
                      <option value="publie">Publié (Visible étudiants)</option>
                      <option value="brouillon">Brouillon (Masqué)</option>
                      <option value="archive">Archivé</option>
                    </select>
                  </div>
                </div>

                {/* Dates (Publication & Remise) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Date de publication *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.publishDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, publishDate: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/20 outline-none text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Date limite de remise (Deadline) *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/20 outline-none text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Consignes complémentaires */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Consignes complémentaires (Optionnel)
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, instructions: e.target.value }))
                    }
                    rows={3}
                    placeholder="Consignes textuelles additionnelles pour la remise du travail..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/20 outline-none text-xs"
                  />
                </div>

                {/* Pièces jointes R2 */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Pièces jointes consignes (Stockage Cloudflare R2)
                  </label>

                  {/* Fichiers déjà attachés */}
                  {existingFiles.length > 0 && (
                    <div className="space-y-1.5 mb-2">
                      <span className="text-[11px] font-semibold text-slate-600">Fichiers actuels :</span>
                      <div className="flex flex-wrap gap-2">
                        {existingFiles.map((file, idx) => (
                          <div
                            key={file.id || idx}
                            className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-blue-950" />
                            <span className="font-medium">{file.originalName}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setExistingFiles((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nouveaux fichiers à téléverser */}
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setPendingUploadFiles(Array.from(e.target.files));
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    PDF, Word, ZIP, Images. Max 20 Mo par fichier.
                  </p>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingDevoir || uploadingFiles}
                    className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50"
                  >
                    {submittingDevoir
                      ? "Enregistrement..."
                      : editingAssignment
                      ? "Mettre à jour le travail"
                      : "Publier le travail"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
