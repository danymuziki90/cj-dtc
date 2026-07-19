"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, Landmark, Mail, MapPin, Send, ShieldCheck } from "lucide-react";
import AdvisorContactSection from "@/components/AdvisorContactSection";

const faqs = [
  ["Comment choisir la formation adaptée ?", "Un conseiller analyse votre profil, votre niveau et vos objectifs afin de vous orienter vers le programme le plus pertinent."],
  ["Puis-je suivre une formation à distance ?", "Oui. Selon le programme, nos parcours sont proposés en ligne, en présentiel ou dans un format hybride."],
  ["Sous quel délai recevrai-je une réponse ?", "Nous répondons rapidement pendant les heures d'ouverture, et au plus tard sous 24 heures ouvrées pour les demandes par e-mail ou formulaire."],
];

export default function ContactPage() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "fr";
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Contact request failed");
      setForm({ name: "", email: "", subject: "", message: "" });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative isolate overflow-hidden bg-slate-950 py-16 text-white sm:py-20 lg:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.45),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,.25),transparent_28%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Retour à l&apos;accueil</Link>
          <div className="mt-12 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100"><ShieldCheck className="h-4 w-4" />CJ Development Training Center</span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Parlons de votre projet de formation.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Une question, un besoin de formation pour votre équipe ou un projet de partenariat ? Notre équipe vous accompagne avec des réponses claires et adaptées.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#contact-form" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50">Envoyer un message <ArrowRight className="h-4 w-4" /></a>
              <a href="https://wa.me/243995136626?text=Bonjour%2C%20je%20souhaite%20obtenir%20des%20informations." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3 font-bold text-white transition hover:bg-white/10">Discuter sur WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      <AdvisorContactSection />

      <section id="contact-form" className="scroll-mt-8 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.08fr_.92fr] lg:px-8">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Formulaire de contact</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Expliquez-nous votre besoin</h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-600">Décrivez votre demande : un conseiller vous répondra avec les informations utiles pour avancer sereinement.</p>
            {status === "success" ? (
              <div role="status" className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950"><CheckCircle2 className="h-8 w-8 text-emerald-600" /><h3 className="mt-3 font-bold">Votre message a bien été envoyé.</h3><p className="mt-1 text-sm text-emerald-800">Notre équipe revient vers vous dans les meilleurs délais.</p></div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,.08)] sm:p-8">
                {status === "error" && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">Une erreur est survenue. Veuillez réessayer ou nous écrire directement par e-mail.</p>}
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-bold text-slate-700">Nom complet<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" placeholder="Votre nom" /></label>
                  <label className="text-sm font-bold text-slate-700">E-mail<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" placeholder="vous@exemple.com" /></label>
                </div>
                <label className="block text-sm font-bold text-slate-700">Sujet<input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" placeholder="Ex. Information sur une formation" /></label>
                <label className="block text-sm font-bold text-slate-700">Message<textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" placeholder="Comment pouvons-nous vous aider ?" /></label>
                <button disabled={status === "sending"} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"><Send className="h-4 w-4" />{status === "sending" ? "Envoi en cours..." : "Envoyer le message"}</button>
              </form>
            )}
          </div>

          <aside className="space-y-5 lg:pt-12">
            <div className="rounded-2xl bg-slate-950 p-7 text-white sm:p-8"><Landmark className="h-7 w-7 text-blue-300" /><h2 className="mt-5 text-2xl font-bold">Passez nous voir</h2><p className="mt-3 leading-7 text-slate-300">Avenue des Aviateurs, Commune de la Gombe<br />Kinshasa, République Démocratique du Congo</p><a href="https://maps.google.com/?q=CJ+DTC+Kinshasa" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 font-bold text-blue-200 transition hover:text-white">Voir sur Google Maps <MapPin className="h-4 w-4" /></a></div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-7 sm:p-8"><Mail className="h-7 w-7 text-blue-700" /><h2 className="mt-5 text-xl font-bold text-slate-950">Besoin d&apos;une réponse détaillée ?</h2><p className="mt-2 leading-7 text-slate-600">Pour les partenariats, les formations en entreprise ou les demandes documentées, privilégiez l&apos;e-mail.</p><a href="mailto:contact@cjdevelopmenttc.org" className="mt-5 inline-flex break-all font-bold text-blue-700 underline-offset-4 hover:underline">contact@cjdevelopmenttc.org</a></div>
          </aside>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20"><div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"><div className="text-center"><span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-blue-700"><CircleHelp className="h-4 w-4" />Questions fréquentes</span><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Avant de nous écrire</h2></div><div className="mt-10 space-y-4">{faqs.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><summary className="cursor-pointer list-none pr-8 font-bold text-slate-900">{question}<span className="float-right text-xl text-blue-600 transition group-open:rotate-45">+</span></summary><p className="mt-4 leading-7 text-slate-600">{answer}</p></details>)}</div></div></section>
    </main>
  );
}
