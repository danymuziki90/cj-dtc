'use client'

type PaginationState = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

export default function PaginationControls({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: {
  pagination: PaginationState
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}) {
  if (!pagination.totalItems) {
    return null
  }

  const startItem = (pagination.page - 1) * pagination.pageSize + 1
  const endItem = Math.min(pagination.totalItems, pagination.page * pagination.pageSize)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span>
          {startItem}-{endItem} sur {pagination.totalItems}
        </span>
        {onPageSizeChange ? (
          <label className="flex items-center gap-2">
            <span>Par page</span>
            <select
              value={pagination.pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPreviousPage}
          className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Precedent
        </button>
        <span>
          Page {pagination.page} / {pagination.totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
          className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  )
}
