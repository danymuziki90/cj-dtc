import Link from 'next/link'

export default function HomeSections() {
    return (
        <div className="container mx-auto px-4">
            <section className="mt-12">
                <h2 className="text-3xl md:text-4xl font-semibold text-cjblue">Depuis 2018</h2>
                <p className="mt-4 text-xl md:text-lg text-gray-700 leading-relaxed max-w-prose">Depuis 2018, <strong>CJ DTC</strong> forme, accompagne et insère durablement des milliers de jeunes et de professionnels à travers l'Afrique. Nos programmes — rigoureux, pratiques et alignés sur les standards internationaux en Management des Ressources Humaines, leadership et employabilité — sont conçus pour favoriser une insertion professionnelle durable et mesurable.</p>

                <p className="mt-3 text-sm text-gray-600 italic" lang="en">Since 2018, CJ DTC has trained, supported and sustainably integrated thousands of young people and professionals across Africa through practical, high-quality programmes aligned with international standards in HR management, leadership and employability.</p>

                <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/fr/espace-etudiants/inscription" className="btn-primary">S’inscrire maintenant</Link>
                    <Link href="/fr/formations" className="inline-block bg-white text-[var(--cj-blue)] px-4 py-2 rounded font-medium">Découvrir nos formations</Link>
                    <Link href="/fr/formations/iop" className="inline-block border border-gray-200 px-4 py-2 rounded text-gray-700">Rejoindre le programme IOP</Link>
                    <Link href="/fr/contact" className="inline-block text-gray-700 hover:underline">Contacter le siège</Link>
                </div>
            </section>

            <section className="mt-12 grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 border rounded">
                    <h3 className="font-semibold text-cjblue">Programmes</h3>
                    <p className="mt-2 text-gray-700">IOP, MRH, Leadership, Family Business.</p>
                </div>
                <div className="p-6 bg-gray-50 border rounded">
                    <h3 className="font-semibold text-cjblue">Espace Étudiants</h3>
                    <p className="mt-2 text-gray-700">Inscription, dépôt de TP, accès e-learning.</p>
                </div>
                <div className="p-6 bg-gray-50 border rounded">
                    <h3 className="font-semibold text-cjblue">Partenaires</h3>
                    <p className="mt-2 text-gray-700">Universités, ministères, ONG et entreprises.</p>
                </div>
            </section>

            <section className="mt-10">
                <h3 className="text-2xl font-semibold text-cjblue">Nos chiffres clés</h3>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded text-center">
                        <div className="text-2xl font-bold text-cjblue">Depuis 2018</div>
                        <div className="text-sm text-gray-500 mt-1">Années d'expérience</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded text-center">
                        <div className="text-2xl font-bold text-cjblue">Des milliers</div>
                        <div className="text-sm text-gray-500 mt-1">Participants formés</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded text-center">
                        <div className="text-2xl font-bold text-cjblue">Universités &amp; Entreprises</div>
                        <div className="text-sm text-gray-500 mt-1">Partenaires</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded text-center">
                        <div className="text-2xl font-bold text-cjblue">Taux élevé</div>
                        <div className="text-sm text-gray-500 mt-1">d'insertion</div>
                    </div>
                </div>
            </section>

            <section className="mt-10">
                <h3 className="text-2xl font-semibold text-cjblue">Témoignages</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <blockquote className="p-4 bg-gray-50 rounded">
                        <p className="text-gray-800">« Grâce au programme IOP, j'ai décroché un poste en RH deux mois après ma formation. »</p>
                        <cite className="block mt-2 text-sm text-gray-600">— Amina K., Kinshasa</cite>
                    </blockquote>
                    <blockquote className="p-4 bg-gray-50 rounded">
                        <p className="text-gray-800">« Les ateliers pratiques m'ont permis d'acquérir des compétences immédiatement applicables. »</p>
                        <cite className="block mt-2 text-sm text-gray-600">— Jean M., Conakry</cite>
                    </blockquote>
                </div>
            </section>

            <section className="mt-10">
                <h3 className="text-2xl font-semibold text-cjblue">Partenaires</h3>
                <p className="mt-4 text-gray-700">Nous travaillons avec des universités, Ministères, ONG et entreprises locales et internationales.</p>
                <div className="mt-4 flex flex-wrap gap-4">
                    <span className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-700">Université partenaire</span>
                    <span className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-700">Ministère</span>
                    <span className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-700">ONG</span>
                    <span className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-700">Entreprise</span>
                </div>
            </section>

            <section className="mt-10 bg-gray-100 p-6 rounded">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h4 className="text-lg font-semibold text-cjblue">Abonnez-vous à notre newsletter</h4>
                        <p className="text-sm text-gray-700 mt-1">Recevez les dernières formations et offres directement dans votre boîte.</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <a href="mailto:contact@cjdevelopmenttc.com?subject=Inscription%20Newsletter" className="btn-primary">S'abonner</a>
                        <span className="text-sm text-gray-700">ou envoyez un email à <a href="mailto:contact@cjdevelopmenttc.com" className="underline">contact@cjdevelopmenttc.com</a></span>
                    </div>
                </div>
            </section>
        </div>
    )
}