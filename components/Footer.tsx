import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-5"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Wave Separator */}
      <div className="relative">
        <svg className="w-full h-16 fill-slate-900" viewBox="0 0 1440 64" preserveAspectRatio="none">
          <path d="M0,32 C480,64 960,0 1440,32 L1440,64 L0,64 Z" opacity="0.3"></path>
          <path d="M0,48 C480,16 960,80 1440,48 L1440,64 L0,64 Z" opacity="0.5"></path>
        </svg>
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 lg:gap-8 mb-12 sm:mb-16">
          {/* Brand Section - 2 cols */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="group">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg sm:text-xl">CJ</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl text-white">CJ DEVELOPMENT</h3>
                  <p className="text-blue-300 text-xs sm:text-sm font-medium">TRAINING CENTER</p>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed text-xs sm:text-sm mb-4 sm:mb-6">
                Centre Panafricain d'Excellence en Formation Professionnelle, 
                Leadership et Insertion. <span className="font-semibold text-white">Bâtir des compétences. 
                Transformer des destins.</span>
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white mb-1">15+</div>
                  <div className="text-xs text-blue-300">Années</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white mb-1">10+</div>
                  <div className="text-xs text-blue-300">Pays</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white mb-1">8500+</div>
                  <div className="text-xs text-blue-300">Étudiants</div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">Suivez-nous</h4>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <a 
                  href="https://www.linkedin.com/company/CJDevelopmentCenter" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="LinkedIn" 
                  className="group relative w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065z" />
                  </svg>
                </a>

                <a 
                  href="https://www.facebook.com/CJDevelopmentCenter" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook" 
                  className="group relative w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                <a 
                  href="https://x.com/CJDevelopmentCenter" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="X (Twitter)" 
                  className="group relative w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.36 5.64a1 1 0 0 0-1.41 0L12 10.59 7.05 5.64A1 1 0 0 0 5.64 7.05L10.59 12l-4.95 4.95a1 1 0 1 0 1.41 1.41L12 13.41l4.95 4.95a1 1 0 0 0 1.41-1.41L13.41 12l4.95-4.95a1 1 0 0 0 0-1.41z" />
                  </svg>
                </a>

                <a 
                  href="https://t.me/+ukOVkVi8tlA2ZTI0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Telegram" 
                  className="group relative w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-5 h-5 text-[#26A5E3]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1.4 14.2l-1.2-1.5-2.6 1 5.3-6.3 1.9 1.3-4.4 5.5z" />
                  </svg>
                </a>

                <a 
                  href="https://chat.whatsapp.com/CuzmyG3JobMGm4Lhk0DROb" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="WhatsApp" 
                  className="group relative w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.52 3.48A11.92 11.92 0 0012 0C5.37 0 .08 5.29.08 11.92c0 2.1.54 4.16 1.56 5.98L0 24l6.35-1.64A11.92 11.92 0 0012 23.92c6.63 0 11.92-5.29 11.92-11.92 0-3.18-1.24-6.17-3.4-8.52zM12 21.77c-1.37 0-2.71-.36-3.88-1.05l-.28-.16-3.77.97.98-3.67-.18-.29A8.01 8.01 0 013.92 11.92c0-4.42 3.58-8 8-8 4.42 0 8 3.58 8 8 0 4.42-3.58 8-8 8zm4.35-6.9c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12s-.62.78-.76.94c-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.12-.12.26-.31.38-.47.12-.16.16-.28.24-.46.08-.18.04-.35-.02-.49-.06-.15-.54-1.29-.74-1.77-.2-.48-.4-.41-.55-.41-.14 0-.3-.02-.46-.02s-.49.08-.75.36c-.26.28-1 1-1 2.43s1.02 2.82 1.16 3.01c.14.19 2.01 3.07 4.87 4.3 1.86.8 2.51.84 3.41.7.9-.14 2.86-1.17 3.27-2.29.4-1.12.4-2.09.28-2.29-.12-.2-.44-.32-.68-.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Formations Section */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg text-white mb-6 relative">
              <span className="relative z-10">Formations</span>
              <div className="absolute -bottom-2 left-0 w-8 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/fr/formations" className="group flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4 mr-2 text-blue-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Toutes nos formations
                </Link>
              </li>
              <li>
                <Link href="/fr/formations/iop" className="group flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4 mr-2 text-blue-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  IOP
                </Link>
              </li>
              <li>
                <Link href="/fr/formations/mrh" className="group flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4 mr-2 text-blue-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  MRH
                </Link>
              </li>
              <li>
                <Link href="/fr/formations/leadership" className="group flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4 mr-2 text-blue-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Leadership
                </Link>
              </li>
              <li>
                <Link href="/fr/programmes" className="group flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4 mr-2 text-blue-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Programmes
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources Section */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg text-white mb-6 relative">
              <span className="relative z-10">Ressources</span>
              <div className="absolute -bottom-2 left-0 w-8 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/fr/actualites" className="group flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4 mr-2 text-purple-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Actualités
                </Link>
              </li>
              <li>
                <Link href="/fr/certificates" className="group flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4 mr-2 text-purple-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Vérifier un certificat
                </Link>
              </li>
              <li>
                <Link href="/fr/espace-etudiants" className="group flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4 mr-2 text-purple-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Espace Étudiants
                </Link>
              </li>
              <li>
                <Link href="/fr/partenaires" className="group flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4 mr-2 text-purple-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Partenaires
                </Link>
              </li>
              <li>
                <Link href="/fr/services" className="group flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4 mr-2 text-purple-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg text-white mb-6 relative">
              <span className="relative z-10">Contact</span>
              <div className="absolute -bottom-2 left-0 w-8 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
            </h4>
            <ul className="space-y-4">
              <li className="group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <a
                    href="mailto:contact@cjdevelopmenttc.com"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    <span className="font-medium text-white">Email</span>
                    <br />
                    contact@cjdevelopmenttc.com
                  </a>
                </div>
              </li>

              <li className="group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="font-medium text-white">RDC</span>
                    <div className="flex flex-col gap-1 mt-1">
                      <a href="tel:+243995136626" className="hover:text-white transition-colors duration-300">
                        +243 995 136 626
                      </a>
                      <a href="tel:+243999482140" className="hover:text-white transition-colors duration-300">
                        +243 999 482 140
                      </a>
                    </div>
                  </div>
                </div>
              </li>

              <li className="group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="font-medium text-white">Guinée</span>
                    <div className="mt-1">
                      <a href="tel:+224626146065" className="hover:text-white transition-colors duration-300">
                        +224 626 14 60 65
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Restez informé</h3>
                <p className="text-gray-300 text-sm">
                  Recevez nos dernières actualités, formations et opportunités directement dans votre boîte mail.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Votre email..."
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                  S'abonner
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-300">
              <p>© {currentYear} CJ DEVELOPMENT TRAINING CENTER</p>
              <span className="hidden sm:inline text-gray-500">|</span>
              <p>Tous droits réservés</p>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-end gap-6 text-sm">
              <Link href="/fr/about" className="group text-gray-300 hover:text-white transition-all duration-300 flex items-center">
                À propos
                <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/fr/contact" className="group text-gray-300 hover:text-white transition-all duration-300 flex items-center">
                Contact
                <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#" className="group text-gray-300 hover:text-white transition-all duration-300 flex items-center">
                Mentions légales
                <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a href="#" className="group text-gray-300 hover:text-white transition-all duration-300 flex items-center">
                Politique de confidentialité
                <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-8 fill-slate-900" viewBox="0 0 1440 32" preserveAspectRatio="none">
            <path d="M0,16 C480,32 960,0 1440,16 L1440,32 L0,32 Z" opacity="0.3"></path>
          </svg>
        </div>
      </div>
    </footer>
  )
}
