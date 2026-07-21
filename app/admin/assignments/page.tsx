"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToastNotification } from "@/components/ui/toast";
import {
  Star,
  Check,
  X,
  FileText,
  Calendar,
  Download,
  Upload,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  Users,
} from "lucide-react";

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
  type: "tp" | "exam" | "project";
  formationId: number;
  formation: {
    title: string;
  };
  sessionId: number | null;
  session: {
    id: number;
    startDate: string;
    endDate: string;
  } | null;
  deadline: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  instructions: string | null;
  createdAt: string;
  submissions: Submission[];
  files: AssignmentFile[];
}

interface FormationOption {
  id: number;
  title: string;
}

interface SessionOption {
  id: number;
  formationId: number;
  startDate: string;
  endDate: string;
  format: string;
}

export default function AdminAssignmentsPage() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [formations, setFormations] = useState<FormationOption[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire Devoir
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submittingDevoir, setSubmittingDevoir] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "tp" as "tp" | "exam" | "project",
    formationId: 0,
    sessionId: 0,
    deadline: "",
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "doc", "docx", "zip"],
    instructions: "",
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  // Correction & Notation
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);
  const [enrollmentsList, setEnrollmentsList] = useState<Array<{ email: string; name: string }>>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Notation active
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
      setAssignments(data || []);
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
      if (nextFormations.length > 0) {
        setFormData((prev) => ({
          ...prev,
          formationId: prev.formationId || nextFormations[0]?.id || 0,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      const data = await response.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtrer les sessions de la formation sélectionnée
  const filteredSessions = sessions.filter((s) => s.formationId === formData.formationId);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.formationId) {
      error("Veuillez sélectionner une formation.");
      return;
    }

    setSubmittingDevoir(true);

    try {
      let uploadedFileInfo = null;

      // 1. Upload du fichier consigne vers R2 si sélectionné
      if (attachmentFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", attachmentFile);

        const uploadRes = await fetch("/api/admin/assignments/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          throw new Error(uploadErr.error || "Échec du téléversement du fichier.");
        }

        uploadedFileInfo = await uploadRes.json();
      }

      // 2. Création du devoir
      const payload = {
        ...formData,
        sessionId: formData.sessionId || undefined,
        files: uploadedFileInfo
          ? [
              {
                name: uploadedFileInfo.name,
                originalName: uploadedFileInfo.originalName,
                size: uploadedFileInfo.size,
                url: uploadedFileInfo.url,
              },
            ]
          : [],
      };

      const response = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const createErr = await response.json();
        throw new Error(createErr.error || "Erreur lors de la création.");
      }

      const newAssignment = await response.json();
      setAssignments((prev) => [newAssignment, ...prev]);
      setShowCreateForm(false);
      setAttachmentFile(null);
      setFormData({
        title: "",
        description: "",
        type: "tp",
        formationId: formations[0]?.id || 0,
        sessionId: 0,
        deadline: "",
        maxFileSize: 10,
        allowedFileTypes: ["pdf", "doc", "docx", "zip"],
        instructions: "",
      });

      success("Le devoir a été créé et publié avec succès !");
    } catch (err: any) {
      console.error(err);
      error(err.message || "Erreur de création.");
    } finally {
      setSubmittingDevoir(false);
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    if (!confirm("Voulez-vous supprimer ce devoir définitivement ?")) return;

    try {
      const response = await fetch(`/api/admin/assignments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur de suppression");

      setAssignments((prev) => prev.filter((a) => a.id !== id));
      if (selectedAssignment?.id === id) {
        setSelectedAssignment(null);
      }
      success("Devoir supprimé avec succès.");
    } catch (err) {
      console.error(err);
      error("Erreur lors de la suppression.");
    }
  };

  // Charger les remises pour le devoir sélectionné
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

  // Soumettre une note et commentaire
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
        status: status, // graded
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

      if (!response.ok) throw new Error("Erreur de sauvegarde de note");
      const updated = await response.json();

      // Mettre à jour la liste des remises locale
      setSubmissionsList((prev) =>
        prev.map((sub) => (sub.id === activeSubmission.id ? { ...sub, ...updated } : sub))
      );

      // Mettre à jour dans les assignments
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
      success("Note et évaluation enregistrées avec succès !");
    } catch (err) {
      console.error(err);
      error("Erreur lors de la sauvegarde de la note.");
    } finally {
      setSavingGrade(false);
    }
  };

  const handleRequestRevision = async (sub: Submission) => {
    if (!selectedAssignment) return;
    const feedback = prompt("Raison ou consigne de modification pour l'étudiant :");
    if (feedback === null) return;

    try {
      const payload = {
        submissionId: sub.id,
        studentEmail: sub.studentEmail,
        status: "returned",
        grade: null,
        feedback: feedback.trim() || "Consigne de modification demandée.",
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

      success("Demande de nouvelle soumission transmise à l'élève.");
    } catch (err) {
      console.error(err);
      error("Erreur de demande de révision.");
    }
  };

  const openGradeForm = (sub: Submission) => {
    setActiveSubmission(sub);
    setGradeValue(sub.grade !== null ? String(sub.grade) : "");
    setFeedbackValue(sub.feedback || "");
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-blue-900 to-indigo-600 bg-clip-text text-transparent">
            Gestion des Travaux & TP
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Créez, publiez des consignes et notez les devoirs rendus des étudiants.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
        >
          + Nouveau devoir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des devoirs */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-sm text-slate-500">
              Chargement des travaux...
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-sm text-slate-500">
              Aucun devoir créé pour le moment.
            </div>
          ) : (
            assignments.map((assignment) => {
              const overdue = new Date(assignment.deadline) < new Date();
              return (
                <div
                  key={assignment.id}
                  className={`bg-white border rounded-3xl p-6 shadow-sm transition hover:shadow-md cursor-pointer ${
                    selectedAssignment?.id === assignment.id
                      ? "border-blue-900 ring-2 ring-blue-900/10"
                      : "border-slate-100"
                  }`}
                  onClick={() => handleOpenCorrection(assignment)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--admin-primary)] bg-slate-50 px-2 py-0.5 rounded">
                          {assignment.type.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {assignment.formation.title}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mt-1.5">
                        {assignment.title}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAssignment(assignment.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-650 mt-2 line-clamp-2 leading-relaxed">
                    {assignment.description}
                  </p>

                  {/* Fichiers joints consignes */}
                  {assignment.files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {assignment.files.map((file) => (
                        <a
                          key={file.id}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 text-slate-700 hover:bg-slate-100"
                        >
                          <Download className="w-3 h-3" />
                          Consigne: {file.originalName}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Footer infos */}
                  <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 gap-2">
                    <span className={overdue ? "text-red-600 font-bold" : ""}>
                      📅 Deadline: {new Date(assignment.deadline).toLocaleString("fr-FR")}
                    </span>
                    {assignment.session && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        Session: {new Date(assignment.session.startDate).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                    <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full">
                      {assignment.submissions.length} rendu(s)
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
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm sticky top-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Rendus & Notation
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Devoir: <strong>{selectedAssignment.title}</strong>
                </p>
              </div>

              {loadingSubmissions ? (
                <div className="text-center text-xs text-slate-500 py-6">
                  Chargement des rendus...
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Formulaire de notation actif */}
                  {activeSubmission && (
                    <form
                      onSubmit={handleSaveGrade}
                      className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-900">
                          Évaluer {activeSubmission.studentName}
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
                          placeholder="Ex: 15.5"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-950 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase">
                          Commentaire de correction
                        </label>
                        <textarea
                          value={feedbackValue}
                          onChange={(e) => setFeedbackValue(e.target.value)}
                          placeholder="Points forts, axes d'amélioration..."
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-950 outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingGrade}
                        className="w-full flex items-center justify-center py-2 bg-blue-900 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Enregistrer la note
                      </button>
                    </form>
                  )}

                  {/* Liste des étudiants inscrits */}
                  <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                    <span className="block text-xs font-bold text-slate-700 uppercase">
                      Inscrits à la session ({enrollmentsList.length}) :
                    </span>

                    {enrollmentsList.map((enrollment) => {
                      const submission = submissionsList.find(
                        (s) => s.studentEmail.toLowerCase() === enrollment.email.toLowerCase()
                      );

                      return (
                        <div
                          key={enrollment.email}
                          className="border border-slate-100 rounded-2xl p-3 space-y-2 hover:bg-slate-50/50"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <h4 className="font-bold text-xs text-slate-800">
                                {enrollment.name}
                              </h4>
                              <p className="text-[9px] text-slate-400">{enrollment.email}</p>
                            </div>

                            {submission ? (
                              submission.status === "graded" ? (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                  Noté: {submission.grade}/20
                                </span>
                              ) : submission.status === "returned" ? (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                                  À refaire
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800">
                                  Rendu
                                </span>
                              )
                            ) : (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500">
                                Non rendu
                              </span>
                            )}
                          </div>

                          {/* Fichiers rendus */}
                          {submission && (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex flex-wrap gap-1">
                                {submission.files.map((file) => (
                                  <a
                                    key={file.id}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-[9px] text-slate-700 hover:bg-slate-50"
                                  >
                                    <Download className="w-2.5 h-2.5" />
                                    {file.originalName}
                                  </a>
                                ))}
                              </div>

                              {/* Actions sur le rendu */}
                              <div className="flex gap-1.5 pt-1.5 border-t border-slate-100">
                                <button
                                  onClick={() => openGradeForm(submission)}
                                  className="flex-1 py-1 bg-blue-900 hover:bg-blue-800 text-white font-bold text-[9px] rounded-lg text-center"
                                >
                                  Noter
                                </button>
                                <button
                                  onClick={() => handleRequestRevision(submission)}
                                  className="flex-1 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-600 font-bold text-[9px] rounded-lg text-center"
                                >
                                  À refaire
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 border-dashed rounded-3xl p-12 text-center text-xs text-slate-400 shadow-sm sticky top-6">
              Sélectionnez un devoir pour afficher les rendus et noter les étudiants.
            </div>
          )}
        </div>
      </div>

      {/* Modal création devoir */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Créer un travail (TP / Projet / Examen)
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-900 outline-none text-xs"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Description / Description détaillée *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-900 outline-none text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="formationId" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Formation *
                    </label>
                    <select
                      id="formationId"
                      value={formData.formationId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          formationId: Number(e.target.value),
                          sessionId: 0, // Reset session si formation change
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-900 outline-none text-xs"
                      required
                    >
                      <option value={0} disabled>
                        Sélectionnez une formation...
                      </option>
                      {formations.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sessionId" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Session concernée (Optionnel)
                    </label>
                    <select
                      id="sessionId"
                      value={formData.sessionId}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, sessionId: Number(e.target.value) }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-900 outline-none text-xs"
                    >
                      <option value={0}>Toutes les sessions de cette formation</option>
                      {filteredSessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          Session #{s.id} (du{" "}
                          {new Date(s.startDate).toLocaleDateString("fr-FR")})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Type *
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, type: e.target.value as any }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-900 outline-none text-xs"
                      required
                    >
                      <option value="tp">Travail Pratique (TP)</option>
                      <option value="exam">Examen</option>
                      <option value="project">Projet</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="deadline" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Date limite de remise *
                    </label>
                    <input
                      type="datetime-local"
                      id="deadline"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-900 outline-none text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="instructions" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Consignes complémentaires (Optionnel)
                  </label>
                  <textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, instructions: e.target.value }))
                    }
                    rows={3}
                    placeholder="Consignes textuelles additionnelles..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-900 outline-none text-xs"
                  />
                </div>

                {/* Pièce jointe consigne (R2) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Pièce jointe (Fichier consigne R2)
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setAttachmentFile(e.target.files ? e.target.files[0] : null)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">
                    PDF, Word, ZIP, etc. Max 20 Mo. Le fichier sera hébergé sur Cloudflare R2.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingDevoir}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    {submittingDevoir ? "Création..." : "Publier le travail"}
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
