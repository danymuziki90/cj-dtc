import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[var(--cj-blue)] text-white">
      <div className="container mx-auto px-4 py-8 lg:py-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-6">
          {/* Institution Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="CJ DEVELOPMENT TRAINING CENTER" className="h-10" />
              <span className="font-bold text-lg" style={{ color: 'white' }}>CJ DEVELOPMENT TRAINING CENTER</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Centre Panafricain de Formation Professionnelle, Leadership et Insertion.
              Bâtir des compétences. Transformer des destins.
            </p>
            {/* Social Media Links */}
            <div className="flex gap-3 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Formations Section */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Formations</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/fr/formations" className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block">
                  Toutes nos formations
                </Link>
              </li>
              <li>
                <Link href="/fr/formations/iop" className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block">
                  IOP
                </Link>
              </li>
              <li>
                <Link href="/fr/formations/mrh" className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block">
                  MRH
                </Link>
              </li>
              <li>
                <Link href="/fr/formations/leadership" className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block">
                  Leadership
                </Link>
              </li>
              <li>
                <Link href="/fr/programmes" className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block">
                  Programmes
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources Section */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Ressources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/fr/actualites" className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block">
                  Actualités
                </Link>
              </li>
              <li>
                <Link href="/fr/certificates" className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block">
                  Vérifier un certificat
                </Link>
              </li>
              <li>
                <Link href="/fr/espace-etudiants" className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block">
                  Espace Étudiants
                </Link>
              </li>
              <li>
                <Link href="/fr/partenaires" className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block">
                  Partenaires
                </Link>
              </li>
              <li>
                <Link href="/fr/services" className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block">
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href="mailto:contact@cjdevelopmenttc.com"
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Email officiel : contact@cjdevelopmenttc.com
                </a>
              </li>

              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="text-sm text-gray-300">
                  <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                    <span>
                      <span className="font-medium">Téléphone RDC :</span>
                      <a href="tel:+243995136626" className="ml-2 hover:underline">+243 995 136 626</a>
                      <span className="hidden md:inline"> | </span>
                      <a href="tel:+243999482140" className="ml-2 md:ml-0 hover:underline">+243 999 482 140</a>
                    </span>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="text-sm text-gray-300">
                  <span className="font-medium">Téléphone Guinée :</span>
                  <a href="tel:+224626146065" className="ml-2 hover:underline">+224 626 14 60 65</a>
                </div>
              </li>





              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6H8.5v10h3v-4h2c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z" />
                </svg>
                <div className="text-sm text-gray-300">
                  <span className="font-medium">Réseaux :</span>
                  <div className="flex items-center gap-3 mt-1">
                    <a href="https://www.linkedin.com/company/CJDevelopmentCenter" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200">
                      <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065z" />
                      </svg>
                    </a>

                    <a href="https://www.facebook.com/CJDevelopmentCenter" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200">
                      <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>

                    <a href="https://x.com/CJDevelopmentCenter" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200">
                      <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.36 5.64a1 1 0 0 0-1.41 0L12 10.59 7.05 5.64A1 1 0 0 0 5.64 7.05L10.59 12l-4.95 4.95a1 1 0 1 0 1.41 1.41L12 13.41l4.95 4.95a1 1 0 0 0 1.41-1.41L13.41 12l4.95-4.95a1 1 0 0 0 0-1.41z" />
                      </svg>
                    </a>

                    <a href="https://t.me/+ukOVkVi8tlA2ZTI0" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200">
                      <svg className="w-4 h-4 text-[#26A5E3]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1.4 14.2l-1.2-1.5-2.6 1 5.3-6.3 1.9 1.3-4.4 5.5z" />
                      </svg>
                    </a>

                    <a href="https://chat.whatsapp.com/CuzmyG3JobMGm4Lhk0DROb" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200">
                      <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M20.52 3.48A11.92 11.92 0 0012 0C5.37 0 .08 5.29.08 11.92c0 2.1.54 4.16 1.56 5.98L0 24l6.35-1.64A11.92 11.92 0 0012 23.92c6.63 0 11.92-5.29 11.92-11.92 0-3.18-1.24-6.17-3.4-8.52zM12 21.77c-1.37 0-2.71-.36-3.88-1.05l-.28-.16-3.77.97.98-3.67-.18-.29A8.01 8.01 0 013.92 11.92c0-4.42 3.58-8 8-8 4.42 0 8 3.58 8 8 0 4.42-3.58 8-8 8zm4.35-6.9c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12s-.62.78-.76.94c-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.12-.12.26-.31.38-.47.12-.16.16-.28.24-.46.08-.18.04-.35-.02-.49-.06-.15-.54-1.29-.74-1.77-.2-.48-.4-.41-.55-.41-.14 0-.3-.02-.46-.02s-.49.08-.75.36c-.26.28-1 1-1 2.43s1.02 2.82 1.16 3.01c.14.19 2.01 3.07 4.87 4.3 1.86.8 2.51.84 3.41.7.9-.14 2.86-1.17 3.27-2.29.4-1.12.4-2.09.28-2.29-.12-.2-.44-.32-.68-.44z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-sm text-gray-300 text-center md:text-left">
              © {currentYear} CJ DEVELOPMENT TRAINING CENTER. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
              <Link href="/fr/about" className="text-gray-300 hover:text-white transition-colors duration-200">
                À propos
              </Link>
              <Link href="/fr/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                Contact
              </Link>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                Mentions légales
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                Politique de confidentialité
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
