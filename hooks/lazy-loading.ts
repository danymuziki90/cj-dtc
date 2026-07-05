import { useState } from 'react'

// Hook pour le lazy loading conditionnel
export const useLazyLoad = (
  loadFn: () => Promise<any>,
  deps: React.DependencyList = []
) => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await loadFn()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, loadData }
}

// Hook pour l'infinite scroll loading
export const useInfiniteScroll = (
  loadMoreFn: () => Promise<boolean>,
  hasMore: boolean,
  deps: React.DependencyList = []
) => {
  const [loading, setLoading] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(hasMore)

  const loadMore = async () => {
    if (loading || !hasMoreData) return

    setLoading(true)
    const hasMoreResult = await loadMoreFn()
    setHasMoreData(hasMoreResult)
    setLoading(false)
  }

  return { loading, hasMore: hasMoreData, loadMore }
}
