"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { MessageSquare, Star, Send, Clock, CheckCircle2, XCircle } from "lucide-react";
import {
  StudentPageShell,
  StudentSectionCard,
  studentPrimaryButtonClassName,
} from "@/components/ui/student-space";

interface Testimonial {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  formation: {
    id: number;
    title: string;
  } | null;
}

interface Enrollment {
  id: number;
  formationId: number;
  formation: {
    id: number;
    title: string;
  };
  sessionId: number | null;
}

export default function StudentTestimonialsPage() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "fr";

  // Data states
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedFormationId, setSelectedFormationId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resDashboard, resTestimonials] = await Promise.all([
        fetch("/api/student/system/dashboard"),
        fetch("/api/student/testimonials"),
      ]);

      if (resDashboard.ok) {
        const dashData = await resDashboard.json();
        // Filtrer pour ne garder que les formations valides
        const activeEnrollments = (dashData.dashboard?.enrollments || []).filter(
          (e: any) => ["accepted", "confirmed", "completed"].includes(e.status)
        );
        setEnrollments(activeEnrollments);
      }

      if (resTestimonials.ok) {
        const testData = await resTestimonials.json();
        setTestimonials(testData);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedFormationId) {
      setErrorMsg("Veuillez sélectionner une formation.");
      return;
    }

    if (content.trim().length < 20) {
      setErrorMsg("Le témoignage doit contenir au moins 20 caractères.");
      return;
    }

    setSubmitting(true);

    try {
      const enrollmentObj = enrollments.find(
        (e) => String(e.formation.id) === selectedFormationId
      );

      const response = await fetch("/api/student/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formationId: parseInt(selectedFormationId, 10),
          sessionId: enrollmentObj?.sessionId ?? null,
          rating,
          title: title.trim() || null,
          content: content.trim(),
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Une erreur est survenue.");
      }

      setSuccessMsg("Témoignage envoyé pour validation avec succès !");
      setTitle("");
      setContent("");
      setRating(5);
      setSelectedFormationId("");
      
      // Actualiser les témoignages
      fetchInitialData();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full px-3 py-1 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approuvé (Publié)
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 rounded-full px-3 py-1 border border-red-100">
            <XCircle className="w-3.5 h-3.5" />
            Refusé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 rounded-full px-3 py-1 border border-amber-100">
            <Clock className="w-3.5 h-3.5" />
            En attente de validation
          </span>
        );
    }
  };

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace étudiant"
        title="Témoignages & Avis"
        description="Partagez votre expérience sur les formations que vous avez suivies."
        icon={MessageSquare}
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Chargement de la page...
        </div>
      </StudentPageShell>
    );
  }

  // Filtrer les formations pour lesquelles l'étudiant a déjà donné son avis
  const availableFormationsForAvis = enrollments.filter(
    (e) => !testimonials.some((t) => t.formation?.id === e.formation.id)
  );

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace étudiant"
      title="Témoignages & Avis"
      description="Donnez votre avis sur nos formations et aidez d'autres étudiants à s'orienter. Vos retours sont modérés par l'administration avant publication."
      icon={MessageSquare}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulaire de témoignage */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-white bg-white/60 p-6 shadow-sm sticky top-24">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Rédiger un avis
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-normal">
              Partagez votre retour d'expérience constructif.
            </p>

            {availableFormationsForAvis.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
                <p className="text-xs text-slate-600 italic">
                  Vous avez déjà donné votre avis pour toutes vos formations en cours ou terminées. Merci pour votre contribution !
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                    {errorMsg}
                  </p>
                )}
                {successMsg && (
                  <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-600 border border-emerald-100">
                    {successMsg}
                  </p>
                )}

                {/* Formation */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Formation *
                  </label>
                  <select
                    value={selectedFormationId}
                    onChange={(e) => setSelectedFormationId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-950 shadow-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Sélectionnez une formation...</option>
                    {availableFormationsForAvis.map((e) => (
                      <option key={e.id} value={e.formation.id}>
                        {e.formation.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Note */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Note globale *
                  </label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            (hoverRating !== null ? star <= hoverRating : star <= rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Titre */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Titre de votre avis (optionnel)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Excellente formation, très enrichissante..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-950 shadow-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* Contenu */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Votre témoignage *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Décrivez votre expérience avec des détails sur l'apprentissage, les formateurs, etc. (min. 20 caractères)"
                    rows={5}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-950 shadow-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* Bouton */}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`${studentPrimaryButtonClassName} w-full flex items-center justify-center gap-2`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? "Envoi..." : "Envoyer mon avis"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Historique des avis */}
        <div className="lg:col-span-2 space-y-6">
          <StudentSectionCard
            eyebrow="Historique"
            title="Mes avis envoyés"
            description="Suivez l'état de validation de vos témoignages et les réponses de l'administration."
            icon={MessageSquare}
          >
            {testimonials.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                Vous n'avez pas encore envoyé de témoignage.
              </div>
            ) : (
              <div className="space-y-4">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 shadow-sm"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-950">
                          {t.formation?.title || "Formation"}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Envoyé le {new Date(t.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      {getStatusBadge(t.status)}
                    </div>

                    {/* Note et Titre */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
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
                        <span className="text-xs font-semibold text-slate-800">
                          « {t.title} »
                        </span>
                      )}
                    </div>

                    {/* Texte du témoignage */}
                    <p className="testimonial-body-text text-slate-600 italic font-segoe">
                      "{t.content}"
                    </p>

                    {/* Réponse administration */}
                    {t.adminReply && (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs">
                        <div className="font-semibold text-blue-700 mb-1">
                          Réponse de l'administration :
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {t.adminReply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </StudentSectionCard>
        </div>
      </div>
    </StudentPageShell>
  );
}
