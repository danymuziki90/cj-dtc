import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Composant lazy loading pour les images
export const LazyImage: React.FC<{
  src: string
  alt: string
  className?: string
  placeholder?: string
  width?: number
  height?: number
  priority?: boolean
  quality?: number
  fill?: boolean
  unoptimized?: boolean
  onLoad?: () => void
  onError?: () => void
}> = ({
  src,
  alt,
  className = '',
  placeholder = '/placeholder.svg',
  width,
  height,
  priority = false,
  quality = 75,
  fill,
  unoptimized = false,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !hasError && (
        <div className={placeholder}>
          <div className="animate-pulse bg-gray-200 rounded-lg" style={{ width, height }}></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        priority={priority}
        quality={quality}
        fill={fill}
        unoptimized={unoptimized}
      />
    </div>
  )
}

// Composant lazy loading pour les vidéos
export const LazyVideo: React.FC<{
  src: string
  className?: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  preload?: 'auto' | 'metadata' | 'none'
}> = ({
  src,
  poster,
  className = '',
  autoPlay = false,
  muted = true,
  loop = true,
  controls = false,
  preload = 'metadata'
}) => {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = () => setIsLoaded(true)

  return (
    <video
      className={`w-full ${className}`}
      poster={poster}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      controls={controls}
      preload={preload}
      onLoaded={handleLoad}
    >
      <source src={src} type="video/mp4" />
      Votre navigateur ne supporte pas cette vidéo.
    </video>
  )
}

// Composant lazy loading pour les composants lourds
export const LazyComponent: React.FC<{
  component: React.ComponentType<any>
  fallback?: React.ReactNode
}> = ({ component: Component, fallback }) => {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = () => setIsLoaded(true)

  return (
    <Suspense fallback={fallback}>
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cjblue border-t-transparent border-r-transparent border-b-transparent"></div>
      </div>
      <div className="text-center text-gray-600">
        Chargement...
      </div>
    </Suspense>
  )
}
