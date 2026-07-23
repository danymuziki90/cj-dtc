import Link from "next/link";
import { useParams } from "next/navigation";

export default function Hero() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "fr";

  return (
    <section className="relative overflow-hidden rounded-lg shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(2,20,47,0.90)] to-[rgba(0,45,114,0.85)] animate-hero" />
      {/* Overlay rouge accent */}
      <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-[rgba(227,6,19,0.20)] blur-3xl" />
      <div className="relative p-12 text-white">
        <h1 className="text-4xl font-black tracking-tight leading-tight text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Bâtir des compétences. Transformer des destins.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90">
          Programmes certifiants, parcours IOP, leadership & solutions RH pour
          les entreprises. Rejoignez notre réseau panafricain.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/sessions`}
            className="btn-primary inline-block"
          >
            Voir nos sessions ouvertes
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="btn-secondary inline-block"
          >
            Demander un conseil
          </Link>
        </div>
      </div>
    </section>
  );
}
