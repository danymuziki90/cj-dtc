"use client";

import { useEffect, useState } from "react";
import { useToastNotification } from "@/components/ui/toast";
import {
  Star,
  Check,
  X,
  Trash2,
  MessageSquare,
  Search,
  ChevronDown,
  Edit2,
  Save,
} from "lucide-react";

interface Testimonial {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  status: string;
  adminReply: string | null;
  adminNote: string | null;
  createdAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  formation: {
    id: number;
    title: string;
  } | null;
  session: {
    id: number;
    startDate: string;
    endDate: string;
  } | null;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // States pour la modal/section de modification et réponse
  const [activeTestimonial, setActiveTestimonial] = useState<Testimonial | null>(null);
  const [replyText, setReplyText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedRating, setEditedRating] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  const [savingAction, setSavingAction] = useState(false);

  const { success, error } = useToastNotification() || {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg),
  };

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/testimonials?status=${statusFilter}&search=${encodeURIComponent(
        searchQuery
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Erreur lors de la récupération");
      const data = await res.json();
      setTestimonials(data || []);
    } catch (err) {
      console.error(err);
      error("Impossible de charger les témoignages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [statusFilter, searchQuery]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Erreur de modification");
      const updated = await res.json();

      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );

      if (activeTestimonial?.id === id) {
        setActiveTestimonial((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      success(`Témoignage mis à jour avec le statut: ${newStatus}`);
    } catch (err) {
      console.error(err);
      error("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleSaveEditAndReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTestimonial) return;

    setSavingAction(true);
    try {
      const payload: any = {
        adminReply: replyText.trim() || null,
        adminNote: noteText.trim() || null,
      };

      if (isEditing) {
        payload.title = editedTitle.trim() || null;
        payload.content = editedContent.trim();
        payload.rating = editedRating;
      }

      const res = await fetch(`/api/admin/testimonials/${activeTestimonial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur de mise à jour");
      }

      const updated = await res.json();

      setTestimonials((prev) =>
        prev.map((t) => (t.id === activeTestimonial.id ? updated : t))
      );

      setActiveTestimonial(updated);
      setIsEditing(false);
      success("Témoignage mis à jour avec succès.");
    } catch (err: any) {
      console.error(err);
      error(err.message || "Erreur lors de la modification.");
    } finally {
      setSavingAction(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce témoignage définitivement ?")) return;

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erreur de suppression");

      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      if (activeTestimonial?.id === id) {
        setActiveTestimonial(null);
      }
      success("Témoignage supprimé avec succès.");
    } catch (err) {
      console.error(err);
      error("Erreur lors de la suppression.");
    }
  };

  const selectTestimonial = (t: Testimonial) => {
    setActiveTestimonial(t);
    setReplyText(t.adminReply || "");
    setNoteText(t.adminNote || "");
    setEditedTitle(t.title || "");
    setEditedContent(t.content);
    setEditedRating(t.rating);
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Approuvé
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            Refusé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-850">
            En attente
          </span>
        );
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-blue-900 to-indigo-600 bg-clip-text text-transparent">
          Modération des Témoignages
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Approuvez, refusez, modifiez ou répondez aux témoignages soumis par les étudiants. Seuls les avis approuvés apparaissent publiquement.
        </p>
      </div>

      {/* Barre de Filtres et Recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        {/* Onglets Filtres */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200/80 shadow-sm w-full md:w-auto">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition ${
                statusFilter === status
                  ? "bg-blue-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {status === "all"
                ? "Tous"
                : status === "pending"
                ? "En attente"
                : status === "approved"
                ? "Approuvés"
                : "Refusés"}
            </button>
          ))}
        </div>

        {/* Barre de Recherche */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher étudiant, formation..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-2xl bg-white text-xs outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
          />
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des témoignages */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-sm text-slate-500 shadow-sm">
              Chargement des témoignages...
            </div>
          ) : testimonials.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-sm text-slate-500 shadow-sm">
              Aucun témoignage trouvé.
            </div>
          ) : (
            testimonials.map((t) => (
              <div
                key={t.id}
                onClick={() => selectTestimonial(t)}
                className={`bg-white border rounded-3xl p-5 shadow-sm transition hover:shadow-md cursor-pointer ${
                  activeTestimonial?.id === t.id
                    ? "border-blue-950 ring-2 ring-blue-950/20"
                    : "border-slate-100"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                      {t.student.firstName[0]}
                      {t.student.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">
                        {t.student.firstName} {t.student.lastName}
                      </h4>
                      <p className="text-[10px] text-slate-400">{t.student.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(t.status)}
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-semibold text-blue-900 uppercase bg-blue-50 px-2 py-1 rounded">
                    {t.formation?.title || "Formation générale"}
                  </span>
                </div>

                {/* Rating et titre */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= t.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  {t.title && (
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                      « {t.title} »
                    </span>
                  )}
                </div>

                {/* Contenu */}
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic leading-relaxed">
                  "{t.content}"
                </p>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                  <span>Soumis le {new Date(t.createdAt).toLocaleDateString("fr-FR")}</span>
                  {t.adminReply && (
                    <span className="flex items-center gap-1 font-bold text-blue-900 bg-blue-50/50 px-2 py-0.5 rounded-full">
                      <MessageSquare className="w-3 h-3" /> Répondu
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Panneau de modération / actions */}
        <div className="lg:col-span-1">
          {activeTestimonial ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm sticky top-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Détails & Actions
                </h3>
              </div>

              {/* Infos étudiant et formation */}
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  <strong>Auteur :</strong> {activeTestimonial.student.firstName} {activeTestimonial.student.lastName} ({activeTestimonial.student.email})
                </p>
                <p className="text-xs text-slate-500">
                  <strong>Formation :</strong> {activeTestimonial.formation?.title || "Formation générale"}
                </p>
                {activeTestimonial.session && (
                  <p className="text-xs text-slate-500">
                    <strong>Session :</strong> du {new Date(activeTestimonial.session.startDate).toLocaleDateString("fr-FR")} au {new Date(activeTestimonial.session.endDate).toLocaleDateString("fr-FR")}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-500"><strong>Statut :</strong></span>
                  {getStatusBadge(activeTestimonial.status)}
                </div>
              </div>

              <form onSubmit={handleSaveEditAndReply} className="space-y-4">
                {/* Mode Édition / Correction */}
                <div className="border border-slate-100 bg-slate-50/30 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Contenu & Note</span>
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-xs font-bold text-blue-900 flex items-center gap-1 hover:underline"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      {isEditing ? "Annuler modifs" : "Corriger fautes"}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      {/* Note */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Note</label>
                        <select
                          value={editedRating}
                          onChange={(e) => setEditedRating(parseInt(e.target.value, 10))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-950 outline-none"
                        >
                          {[1, 2, 3, 4, 5].map((r) => (
                            <option key={r} value={r}>
                              {r} {r === 1 ? "étoile" : "étoiles"}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Titre */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Titre</label>
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-950 outline-none"
                        />
                      </div>

                      {/* Contenu */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Témoignage</label>
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          rows={4}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-950 outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= activeTestimonial.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      {activeTestimonial.title && (
                        <p className="text-xs font-bold text-slate-900 italic">
                          « {activeTestimonial.title} »
                        </p>
                      )}
                      <p className="text-xs text-slate-650 italic leading-relaxed whitespace-pre-line">
                        "{activeTestimonial.content}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Réponse publique */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Répondre à l'étudiant
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Saisissez une réponse visible par l'étudiant sur son tableau de bord..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-950 outline-none focus:border-blue-900"
                  />
                </div>

                {/* Notes internes */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Notes internes (Administrateur uniquement)
                  </label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Saisissez une note interne privée..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-950 outline-none focus:border-blue-900"
                  />
                </div>

                {/* Bouton de sauvegarde des modifications / réponses */}
                <button
                  type="submit"
                  disabled={savingAction}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingAction ? "Sauvegarde..." : "Enregistrer les modifications / réponse"}
                </button>
              </form>

              {/* Actions de validation & statut */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="block text-xs font-bold text-slate-750 uppercase mb-2">
                  Action de validation
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStatusChange(activeTestimonial.id, "approved")}
                    disabled={activeTestimonial.status === "approved"}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Approuver
                  </button>
                  <button
                    onClick={() => handleStatusChange(activeTestimonial.id, "rejected")}
                    disabled={activeTestimonial.status === "rejected"}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Refuser
                  </button>
                </div>

                {/* Supprimer définitivement */}
                <button
                  onClick={() => handleDelete(activeTestimonial.id)}
                  className="w-full flex items-center justify-center gap-1.5 mt-2 px-3 py-2.5 text-xs font-bold text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-red-50 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer définitivement
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 border-dashed rounded-3xl p-12 text-center text-xs text-slate-400 shadow-sm sticky top-6">
              Sélectionnez un témoignage pour afficher les détails et appliquer les actions de modération.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
