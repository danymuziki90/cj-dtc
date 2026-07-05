import Link from "next/link";
import { useParams } from "next/navigation";

export default function Hero() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "fr";

  return (
    <section className="relative overflow-hidden rounded-lg shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,45,114,0.85)] to-[rgba(227,6,19,0.7)] animate-hero"></div>
      <div className="relative p-12 text-white">
        <h2 className="text-4xl font-bold">
          Bâtir des compétences. Transformer des destins.
        </h2>
        <p className="mt-4 max-w-2xl">
          Programmes certifiants, parcours IOP, leadership & solutions RH pour
          les entreprises. Rejoignez notre réseau panafricain.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/programmes`}
            className="btn-primary inline-block"
          >
            Voir nos programmes
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="btn-secondary inline-block"
          >
            Demander un conseil
          </Link>
          <Link
            href={`/${locale}/formations`}
            className="btn-secondary inline-block"
          >
            Découvrir nos formations
          </Link>
        </div>
      </div>
    </section>
  );
}
