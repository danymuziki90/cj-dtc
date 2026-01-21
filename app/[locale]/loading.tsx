import { FormationCardSkeleton, ArticleCardSkeleton, HeroSkeleton } from '../../components/LoadingSkeleton'

export default function Loading() {
  return (
    <div>
      {/* Hero skeleton */}
      <HeroSkeleton />

      {/* Features skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-12 animate-pulse"></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center p-6">
                <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formations skeleton */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto mb-12 animate-pulse"></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <FormationCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Articles skeleton */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto mb-12 animate-pulse"></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA skeleton */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
        </div>
      </section>
    </div>
  )
}
