export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        {/* Card skeleton */}
        <div className="bg-gray-200 rounded-lg h-48 w-full"></div>
        <div className="space-y-2">
          <div className="bg-gray-200 rounded h-4 w-3/4"></div>
          <div className="bg-gray-200 rounded h-4 w-1/2"></div>
        </div>
      </div>
    </div>
  )
}

export function FormationCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
      </div>
    </div>
  )
}

export function ArticleCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-6 space-y-4">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="h-12 bg-white/20 rounded w-3/4 mx-auto mb-6 animate-pulse"></div>
        <div className="h-6 bg-white/20 rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
        <div className="flex gap-4 justify-center">
          <div className="h-12 bg-white/20 rounded w-48 animate-pulse"></div>
          <div className="h-12 bg-white/20 rounded w-48 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
