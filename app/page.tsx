import Link from 'next/link'
import Image from 'next/image'
import HomeSections from '../components/HomeSections'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Ultra-Moderne 3.0 */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 overflow-hidden">
        {/* Advanced Animated Background */}
        <div className="absolute inset-0">
          {/* Dynamic Grid Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 animate-pulse"></div>
          </div>
          
          {/* Enhanced Floating Orbs */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-br from-indigo-600 to-purple-500 rounded-full filter blur-3xl opacity-35 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-pink-600 to-rose-500 rounded-full filter blur-3xl opacity-30 animate-pulse delay-2000"></div>
          <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-br from-amber-600 to-orange-500 rounded-full filter blur-3xl opacity-35 animate-pulse delay-3000"></div>
          
          {/* Additional Moving Elements */}
          <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping opacity-75 delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full animate-ping opacity-75 delay-2000"></div>
          
          {/* Floating Lines */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-32 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse delay-500"></div>
            <div className="absolute bottom-32 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-pulse delay-1000"></div>
          </div>
        </div>
        
        {/* Enhanced Navigation Bar */}
        <nav className="relative z-20 flex justify-between items-center px-4 sm:px-6 py-4 sm:py-6 backdrop-blur-md bg-white/5 border-b border-white/10">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-xl opacity-60 group-hover:opacity-80 transition-all duration-300 group-hover:scale-110"></div>
              <div className="relative w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-bold text-lg sm:text-2xl">CJ</span>
              </div>
            </div>
            <div>
              <span className="text-white font-bold text-sm sm:text-xl">CJ DEVELOPMENT</span>
              <br />
              <span className="text-blue-300 text-xs sm:text-sm font-medium">TRAINING CENTER</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6 sm:space-x-10">
            <Link href="/fr/formations" className="text-white/80 hover:text-white transition-all duration-300 hover:scale-110 font-medium text-sm sm:text-lg">Formations</Link>
            <Link href="/fr/partenaires" className="text-white/80 hover:text-white transition-all duration-300 hover:scale-110 font-medium text-sm sm:text-lg">Partenaires</Link>
            <Link href="/contact" className="text-white/80 hover:text-white transition-all duration-300 hover:scale-110 font-medium text-sm sm:text-lg">Contact</Link>
            <Link href="/admin" className="px-4 sm:px-6 py-2 sm:py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-sm sm:text-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              Admin
            </Link>
          </div>
        </nav>
        
        <div className="relative z-10 w-full px-4 sm:px-6 py-12 sm:py-20 lg:py-32">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-16 lg:gap-24 items-center min-h-[600px] sm:min-h-[700px] lg:min-h-[800px]">
            {/* Enhanced Content Left */}
            <div className="space-y-6 sm:space-y-8 lg:space-y-12">
              {/* Premium Badge 3.0 */}
              <div className="inline-flex items-center px-4 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 backdrop-blur-lg border border-white/30 rounded-full text-white font-bold text-sm sm:text-base lg:text-lg shadow-2xl">
                <span className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 sm:mr-5 animate-pulse shadow-xl shadow-green-400/50"></span>
                <span className="flex items-center">
                  🏆 Leader de la formation professionnelle en Afrique
                  <span className="ml-2 sm:ml-3 text-yellow-400 font-bold">depuis 2010</span>
                </span>
              </div>
              
              {/* Monumental Title */}
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-9xl font-black leading-tight tracking-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                    CJ
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                    DEVELOPMENT
                  </span>
                  <br />
                  <span className="text-white drop-shadow-2xl">TRAINING CENTER</span>
                </h1>
                
                {/* Enhanced Subtitle */}
                <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-blue-100 leading-relaxed max-w-2xl sm:max-w-3xl lg:max-w-4xl font-light">
                  Transformez votre avenir avec nos formations 
                  <span className="font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent text-xl sm:text-2xl lg:text-3xl xl:text-4xl"> d'excellence</span>. 
                  Rejoignez nos <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-cyan-400">5000+</span> diplômés qui réussissent.
                </p>
              </div>
              
              {/* Enhanced Statistics */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:gap-12 pt-6 sm:pt-8 lg:pt-10">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-300 group-hover:scale-110"></div>
                  <div className="relative text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-2 sm:mb-3 group-hover:scale-110 transition-all duration-300">
                    5000+
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm font-bold uppercase tracking-wider">Étudiants formés</div>
                  <div className="w-full h-2 sm:h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2 sm:mt-4 group-hover:scale-x-110 transition-all duration-300 origin-left"></div>
                </div>
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-300 group-hover:scale-110"></div>
                  <div className="relative text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-2 sm:mb-3 group-hover:scale-110 transition-all duration-300">
                    95%
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm font-bold uppercase tracking-wider">Taux d'insertion</div>
                  <div className="w-full h-2 sm:h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-2 sm:mt-4 group-hover:scale-x-110 transition-all duration-300 origin-left"></div>
                </div>
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-300 group-hover:scale-110"></div>
                  <div className="relative text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-2 sm:mb-3 group-hover:scale-110 transition-all duration-300">
                    50+
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm font-bold uppercase tracking-wider">Partenaires</div>
                  <div className="w-full h-2 sm:h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 sm:mt-4 group-hover:scale-x-110 transition-all duration-300 origin-left"></div>
                </div>
              </div>
              
              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 lg:pt-12">
                <Link 
                  href='/fr/formations' 
                  className="group relative px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base lg:text-xl hover:shadow-3xl transform hover:-translate-y-2 sm:hover:-translate-y-3 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Découvrir nos formations
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 ml-2 sm:ml-3 lg:ml-4 group-hover:translate-x-2 sm:group-hover:translate-x-3 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                </Link>
                
                <Link 
                  href='/contact' 
                  className="group px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 border-2 sm:border-3 border-white/40 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base lg:text-xl hover:bg-white/15 hover:border-white/70 hover:shadow-3xl transform hover:-translate-y-2 sm:hover:-translate-y-3 transition-all duration-300 backdrop-blur-md"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 mr-2 sm:mr-3 lg:mr-4 group-hover:scale-110 sm:group-hover:scale-125 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Nous contacter
                  </span>
                </Link>
              </div>
              
              {/* Enhanced Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 lg:gap-10 pt-4 sm:pt-6 lg:pt-8">
                <div className="flex items-center text-blue-200 text-sm sm:text-base lg:text-lg font-bold group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 sm:group-hover:scale-125 transition-all duration-300 shadow-lg">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-bold">Certifié ISO 9001</span>
                </div>
                <div className="flex items-center text-blue-200 text-sm sm:text-base lg:text-lg font-bold group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 sm:group-hover:scale-125 transition-all duration-300 shadow-lg">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="text-white font-bold">4.9/5 étoiles</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Image Section */}
            <div className="relative group">
              {/* Triple Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 via-purple-600/40 to-pink-600/40 rounded-2xl sm:rounded-3xl transform rotate-6 blur-2xl sm:blur-3xl group-hover:rotate-3 transition-all duration-700 group-hover:scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-cyan-600/30 via-indigo-600/30 to-blue-600/30 rounded-2xl sm:rounded-3xl transform -rotate-6 blur-2xl sm:blur-3xl group-hover:-rotate-3 transition-all duration-700 group-hover:scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-red-600/20 rounded-2xl sm:rounded-3xl transform rotate-12 blur-xl sm:blur-2xl group-hover:rotate-6 transition-all duration-700 group-hover:scale-105"></div>
              
              {/* Main Image Enhanced */}
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl sm:shadow-3xl overflow-hidden border-2 border-white/30 group-hover:shadow-3xl sm:group-hover:shadow-4xl transition-all duration-300">
                <Image
                  src="/hero-placeholder.jpg"
                  alt="CJ DEVELOPMENT TRAINING CENTER"
                  width={600}
                  height={400}
                  className="w-full h-auto transform group-hover:scale-105 transition-all duration-700"
                  priority
                />
                
                {/* Enhanced Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                {/* Floating Badge Enhanced */}
                <div className="absolute top-6 sm:top-8 lg:top-10 right-6 sm:right-8 lg:right-10 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl sm:rounded-2xl font-bold shadow-xl sm:shadow-2xl animate-bounce">
                  <span className="flex items-center text-sm sm:text-base lg:text-lg">
                    🎓 Excellence
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ml-2 sm:ml-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </span>
                </div>
                
                {/* Enhanced Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent p-4 sm:p-6 lg:p-10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-white text-center sm:text-left">
                      <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 sm:mb-3">Excellence depuis 2010</div>
                      <div className="text-xs sm:text-sm lg:text-base font-medium text-blue-200">Formation professionnelle de qualité internationale</div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-yellow-400 fill-current drop-shadow-lg sm:drop-shadow-xl" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Floating Cards */}
              <div className="absolute top-8 sm:top-12 lg:top-16 -left-8 sm:-left-12 lg:-left-16 bg-white/95 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl sm:shadow-3xl transform rotate-12 hover:rotate-0 transition-all duration-500 hover:scale-110 group-hover:translate-x-4 sm:group-hover:translate-x-6">
                <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm sm:text-base lg:text-xl">Certification</div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">Reconnue internationalement</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-8 sm:bottom-12 lg:bottom-16 -right-8 sm:-right-12 lg:-right-16 bg-white/95 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl sm:shadow-3xl transform -rotate-12 hover:rotate-0 transition-all duration-500 hover:scale-110 group-hover:-translate-x-4 sm:group-hover:-translate-x-6">
                <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm sm:text-base lg:text-xl">Flexibilité</div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">Formations en ligne & présentiel</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Scroll Indicator */}
          <div className="absolute bottom-8 sm:bottom-12 lg:bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center text-white/60 animate-bounce group cursor-pointer">
              <span className="text-xs sm:text-sm lg:text-base mb-2 sm:mb-3 lg:mb-4 font-bold group-hover:text-white transition-all duration-300">Découvrir plus</span>
              <div className="w-6 h-12 sm:w-8 sm:h-14 lg:w-10 lg:h-16 border-2 sm:border-3 border-white/40 rounded-full flex justify-center group-hover:border-white/80 transition-all duration-300">
                <div className="w-1 h-2 sm:w-2 sm:h-3 lg:w-2 lg:h-4 bg-white/60 rounded-full mt-2 sm:mt-3 lg:mt-4 animate-pulse group-hover:bg-white transition-all duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeSections />
    </div>
  )
}
