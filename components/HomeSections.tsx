import Link from 'next/link'

export default function HomeSections() {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Services aux entreprises avec design moderne */}
            <section className="py-12 sm:py-16 lg:py-20">
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                        Services aux <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">entreprises</span>
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto">
                        Solutions complètes pour optimiser vos ressources humaines et développer votre organisation
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Card 1 - Audit RH */}
                    <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                        {/* Background décoratif */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        
                        <div className="relative p-6 sm:p-8">
                            {/* Icône animée */}
                            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Audit RH</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Diagnostic complet de vos processus RH et recommandations stratégiques.</p>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                                <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm">Diagnostic</span>
                                <span className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm">Optimisation</span>
                            </div>
                            
                            <Link 
                                href="/fr/services/audit-rh" 
                                className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm sm:text-base"
                            >
                                En savoir plus
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Card 2 - Recrutement */}
                    <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        
                        <div className="relative p-6 sm:p-8">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Recrutement</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Sélection et intégration des talents adaptés à votre culture d'entreprise.</p>
                            
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                                <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm">Sourcing</span>
                                <span className="px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm">Évaluation</span>
                            </div>
                            
                            <Link 
                                href="/fr/services/recrutement" 
                                className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors text-sm sm:text-base"
                            >
                                En savoir plus
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Card 3 - Formations sur mesure */}
                    <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        
                        <div className="relative p-6 sm:p-8">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Formations sur mesure</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Programmes de formation personnalisés selon vos besoins spécifiques.</p>
                            
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                                <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm">Personnalisation</span>
                                <span className="px-2 sm:px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs sm:text-sm">Performance</span>
                            </div>
                            
                            <Link 
                                href="/fr/services/formations-entreprise" 
                                className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition-colors text-sm sm:text-base"
                            >
                                En savoir plus
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Card 4 - Gouvernance et consulting */}
                    <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        
                        <div className="relative p-6 sm:p-8">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Gouvernance et consulting</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Conseil stratégique pour optimiser votre structure organisationnelle.</p>
                            
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                                <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs sm:text-sm">Stratégie</span>
                                <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm">Organisation</span>
                            </div>
                            
                            <Link 
                                href="/fr/services/gouvernance" 
                                className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700 transition-colors text-sm sm:text-base"
                            >
                                En savoir plus
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Card 5 - Coaching exécutif */}
                    <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        
                        <div className="relative p-6 sm:p-8">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Coaching exécutif</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Accompagnement personnalisé pour développer votre leadership.</p>
                            
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                                <span className="px-2 sm:px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs sm:text-sm">Leadership</span>
                                <span className="px-2 sm:px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs sm:text-sm">Performance</span>
                            </div>
                            
                            <Link 
                                href="/fr/services/coaching" 
                                className="inline-flex items-center text-teal-600 font-semibold hover:text-teal-700 transition-colors text-sm sm:text-base"
                            >
                                En savoir plus
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Card 6 - Contact Service */}
                    <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-gray-200">
                        
                        <div className="relative p-6 sm:p-8 flex flex-col items-center justify-center text-center h-full">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Besoin d'un conseil ?</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Contactez-nous pour une évaluation personnalisée de vos besoins.</p>
                            
                            <Link 
                                href="/fr/contact" 
                                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base font-medium"
                            >
                                Contacter un expert
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section Témoignages avec design moderne */}
            <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl sm:rounded-3xl">
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                        Ce que nos <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">étudiants</span> disent
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto">
                        Témoignages authentiques de nos anciens étudiants
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
                    {/* Témoignage 1 */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 relative overflow-hidden">
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                            </svg>
                        </div>
                        
                        <div className="flex items-center mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-3 sm:mr-4">
                                AK
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 text-sm sm:text-base">Amina K.</div>
                                <div className="text-xs sm:text-sm text-gray-600">Kinshasa, RDC</div>
                            </div>
                        </div>
                        
                        <blockquote className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
                            « Grâce au programme IOP, j'ai décroché un poste en RH deux mois après ma formation. La qualité de l'enseignement et le suivi des formateurs ont fait toute la différence. »
                        </blockquote>
                        
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                </svg>
                            ))}
                        </div>
                    </div>

                    {/* Témoignage 2 */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 relative overflow-hidden">
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                            </svg>
                        </div>
                        
                        <div className="flex items-center mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold mr-3 sm:mr-4">
                                JM
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 text-sm sm:text-base">Jean M.</div>
                                <div className="text-xs sm:text-sm text-gray-600">Conakry, Guinée</div>
                            </div>
                        </div>
                        
                        <blockquote className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
                            « Les ateliers pratiques m'ont permis d'acquérir des compétences immédiatement applicables. Aujourd'hui je dirige ma propre entreprise grâce à cette formation. »
                        </blockquote>
                        
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                </svg>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section Newsletter avec design moderne */}
            <section className="py-12 sm:py-16 lg:py-20">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
                    {/* Pattern décoratif */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-16 h-16 sm:w-32 sm:h-32 bg-white rounded-full"></div>
                        <div className="absolute bottom-5 sm:bottom-10 right-5 sm:right-10 w-24 h-24 sm:w-48 sm:h-48 bg-white rounded-full"></div>
                    </div>
                    
                    <div className="relative max-w-4xl mx-auto">
                        <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                            </svg>
                            Restez informé
                        </div>
                        
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
                            Abonnez-vous à notre newsletter
                        </h2>
                        
                        <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                            Recevez les dernières formations, offres exclusives et conseils de carrière directement dans votre boîte mail
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto mb-4 sm:mb-6">
                            <input 
                                type="email" 
                                placeholder="Votre adresse email"
                                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 text-sm sm:text-base"
                            />
                            <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base">
                                S'abonner
                            </button>
                        </div>
                        
                        <p className="text-white/80 text-xs sm:text-sm">
                            ou envoyez un email à <a href="mailto:contact@cjdevelopmenttc.com" className="underline hover:text-white transition-colors">contact@cjdevelopmenttc.com</a>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
