"use client";

import { useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TestimonialsSection from "@/components/TestimonialsSection";
import {
  ArrowLeft,
  MessageSquarePlus,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  Quote,
} from "lucide-react";

export default function TemoignagesPage() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "fr";
  const isFr = locale === "fr";

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    formation: "",
    rating: 5,
    title: "",
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.name.trim().length < 2 || formData.content.trim().length < 20) {
      setSubmitResult({
        success: false,
        message: isFr
          ? "Veuillez remplir tous les champs correctement (min. 20 caractères pour le témoignage)."
          : "Please fill in all fields correctly (min. 20 characters for testimonial).",
      });
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: isFr
            ? "Merci pour votre témoignage ! Il sera visible après validation par notre équipe."
            : "Thank you for your testimonial! It will be visible after review by our team.",
        });
        setFormData({ name: "", formation: "", rating: 5, title: "", content: "" });
        setShowForm(false);
      } else {
        const data = await response.json().catch(() => ({}));
        setSubmitResult({
          success: false,
          message:
            data.error ||
            (isFr
              ? "Une erreur est survenue. Veuillez réessayer."
              : "An error occurred. Please try again."),
        });
      }
    } catch {
      setSubmitResult({
        success: false,
        message: isFr
          ? "Impossible d'envoyer votre témoignage. Vérifiez votre connexion."
          : "Unable to send your testimonial. Check your connection.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#001737_0%,#002d72_52%,#0c4da2_100%)] py-20 sm:py-28">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-[var(--cj-red)]/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
          <Quote className="absolute right-8 top-12 h-32 w-32 text-white/[0.04] sm:h-48 sm:w-48 lg:right-20 lg:top-16" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href={`/${locale}/espace-etudiants`}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {isFr ? "Retour à l'espace étudiant" : "Back to student area"}
          </Link>

          {/* Badge */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
              <MessageSquarePlus className="h-3.5 w-3.5 text-[var(--cj-red)]" />
              {isFr ? "Témoignages & Avis" : "Testimonials & Reviews"}
            </span>
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {isFr ? "La parole à nos " : "Hear from our "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">
              {isFr ? "apprenants" : "learners"}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            {isFr
              ? "Découvrez les retours d'expérience authentiques de nos diplômés. Leurs parcours, leurs réussites et leur vision de la formation CJ Development Training Center."
              : "Discover authentic feedback from our graduates. Their journeys, successes and vision of CJ Development Training Center training."}
          </p>

          {/* CTA to submit */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--cj-red)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/30 transition-all hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-xl active:scale-95"
            >
              <MessageSquarePlus className="h-4 w-4" />
              {isFr ? "Partager mon expérience" : "Share my experience"}
            </button>
          </div>
        </div>
      </section>

      {/* Submit Result Notification */}
      {submitResult && (
        <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
              submitResult.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {submitResult.success ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            )}
            <p>{submitResult.message}</p>
          </div>
        </div>
      )}

      {/* Submission Form */}
      {showForm && (
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
          >
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {isFr ? "Soumettre votre témoignage" : "Submit your testimonial"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isFr
                  ? "Votre avis sera publié après validation par notre équipe pédagogique."
                  : "Your review will be published after validation by our teaching team."}
              </p>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="testimonial-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {isFr ? "Votre nom complet" : "Your full name"} *
              </label>
              <input
                id="testimonial-name"
                type="text"
                required
                minLength={2}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isFr ? "Ex. : Marie-Laure K." : "e.g. Marie-Laure K."}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[var(--cj-blue)] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Formation */}
            <div>
              <label htmlFor="testimonial-formation" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {isFr ? "Formation suivie" : "Training program"}
              </label>
              <input
                id="testimonial-formation"
                type="text"
                value={formData.formation}
                onChange={(e) => setFormData({ ...formData, formation: e.target.value })}
                placeholder={isFr ? "Ex. : Management des Ressources Humaines" : "e.g. Human Resources Management"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[var(--cj-blue)] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Title */}
            <div>
              <label htmlFor="testimonial-title" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {isFr ? "Titre de votre avis" : "Review title"}
              </label>
              <input
                id="testimonial-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={isFr ? "Ex. : Une reconversion réussie" : "e.g. A successful career change"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[var(--cj-blue)] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                {isFr ? "Votre note" : "Your rating"}
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="rounded-lg p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    aria-label={`${star} ${isFr ? "étoile(s)" : "star(s)"}`}
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= formData.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-semibold text-slate-500">
                  {formData.rating}/5
                </span>
              </div>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="testimonial-content" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {isFr ? "Votre témoignage" : "Your testimonial"} *
              </label>
              <textarea
                id="testimonial-content"
                required
                minLength={20}
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={
                  isFr
                    ? "Décrivez votre expérience de formation, ce que vous avez appris et comment cela a impacté votre carrière..."
                    : "Describe your training experience, what you learned and how it impacted your career..."
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[var(--cj-blue)] focus:ring-2 focus:ring-blue-100"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                {isFr ? "Minimum 20 caractères" : "Minimum 20 characters"}
              </p>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                {isFr ? "Annuler" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--cj-blue)] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-900 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isFr ? "Envoyer mon témoignage" : "Submit testimonial"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Existing Testimonials Section */}
      <TestimonialsSection locale={locale} />
    </div>
  );
}
