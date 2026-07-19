"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarCheck2, Clock3, Mail, MessageCircle } from "lucide-react";

const whatsappInfo = "https://wa.me/243995136626?text=Bonjour%2C%20je%20souhaite%20obtenir%20des%20informations.";
const whatsappAppointment = "https://wa.me/243995136626?text=Bonjour%2C%20je%20souhaite%20prendre%20rendez-vous%20avec%20un%20conseiller.";

export default function AdvisorContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} data-visible={isVisible} className="overflow-hidden bg-slate-50 py-16 sm:py-20">
      <style>{`@keyframes contact-card-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}.contact-card-in{opacity:0}[data-visible="true"] .contact-card-in{animation:contact-card-in 560ms cubic-bezier(.22,1,.36,1) both}@media (prefers-reduced-motion:reduce){.contact-card-in{opacity:1}[data-visible="true"] .contact-card-in{animation:none}}`}</style>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm"><BadgeCheck className="h-4 w-4" />Une équipe à votre écoute</span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Parlez à un conseiller</h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">Choisissez le moyen de contact qui vous convient. Notre équipe est disponible pour répondre à vos questions et vous accompagner dans le choix de votre formation.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="contact-card-in group flex min-h-[330px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_36px_rgba(37,99,235,0.13)]" style={{ animationDelay: "40ms" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 transition duration-300 group-hover:scale-110"><Mail className="h-6 w-6" /></div>
            <h3 className="mt-6 text-xl font-bold text-slate-950">E-mail</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Écrivez-nous pour toute question concernant nos formations, nos sessions, les inscriptions ou les partenariats.</p>
            <a href="mailto:contact@cjdevelopmenttc.org" className="mt-5 break-all text-sm font-semibold text-blue-700 underline-offset-4 hover:underline">contact@cjdevelopmenttc.org</a>
            <a href="mailto:contact@cjdevelopmenttc.org" className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700">Envoyer un e-mail <ArrowUpRight className="h-4 w-4" /></a>
          </article>
          <article className="contact-card-in group flex min-h-[330px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_36px_rgba(5,150,105,0.13)]" style={{ animationDelay: "120ms" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-100 transition duration-300 group-hover:scale-110"><MessageCircle className="h-6 w-6" /></div>
            <h3 className="mt-6 text-xl font-bold text-slate-950">WhatsApp</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Discutez directement avec un conseiller et obtenez une réponse rapide pendant nos heures d&apos;ouverture.</p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Conversation instantanée</p>
            <a href={whatsappInfo} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">Discuter sur WhatsApp <ArrowUpRight className="h-4 w-4" /></a>
          </article>
          <article className="contact-card-in group flex min-h-[330px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_18px_36px_rgba(124,58,237,0.13)]" style={{ animationDelay: "200ms" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-100 transition duration-300 group-hover:scale-110"><CalendarCheck2 className="h-6 w-6" /></div>
            <h3 className="mt-6 text-xl font-bold text-slate-950">Rendez-vous</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Prenez rendez-vous avec notre équipe pour un accompagnement personnalisé concernant votre projet de formation ou les besoins de votre organisation.</p>
            <p className="mt-5 text-sm font-medium text-violet-700">Un échange adapté à votre projet</p>
            <a href={whatsappAppointment} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-700">Prendre rendez-vous <ArrowUpRight className="h-4 w-4" /></a>
          </article>
          <article className="contact-card-in group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_18px_36px_rgba(217,119,6,0.13)]" style={{ animationDelay: "280ms" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-100 transition duration-300 group-hover:scale-110"><Clock3 className="h-6 w-6" /></div>
            <h3 className="mt-6 text-xl font-bold text-slate-950">Horaires</h3>
            <dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-600">Lundi – Vendredi</dt><dd className="font-semibold text-slate-900">08h00 – 17h00</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-600">Samedi</dt><dd className="font-semibold text-slate-900">09h00 – 13h00</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-600">Dimanche</dt><dd className="font-semibold text-slate-900">Fermé</dd></div></dl>
            <div className="mt-6 inline-flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />Réponse rapide pendant les heures d&apos;ouverture</div>
          </article>
        </div>
        <aside className="contact-card-in mt-8 flex flex-col items-start gap-6 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 p-7 text-white shadow-xl shadow-blue-200 sm:p-9 lg:flex-row lg:items-center lg:justify-between" style={{ animationDelay: "360ms" }}>
          <div className="max-w-3xl"><h3 className="text-xl font-bold sm:text-2xl">Besoin d&apos;aide pour choisir votre formation ?</h3><p className="mt-2 leading-7 text-blue-100">Vous hésitez entre plusieurs programmes ? Un conseiller peut vous orienter en fonction de votre profil, de vos objectifs professionnels et de votre niveau.</p></div>
          <a href="#contact-form" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50">Être accompagné par un conseiller <ArrowRight className="h-4 w-4" /></a>
        </aside>
      </div>
    </section>
  );
}
