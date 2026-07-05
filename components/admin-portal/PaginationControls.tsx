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
    <div className="rounded-[28px] border border-white/80 bg-white/88 px-4 py-4 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.45)] backdrop-blur xl:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-700">
            {startItem}-{endItem} sur {pagination.totalItems}
          </span>
          <span className="text-slate-500">Page {pagination.page} / {pagination.totalPages}</span>
          {onPageSizeChange ? (
            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm">
              <span className="font-medium">Par page</span>
              <select
                value={pagination.pageSize}
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm font-semibold text-slate-700 outline-none"
                aria-label="Par page"
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
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Precedent
          </button>
          <button
            type="button"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="inline-flex items-center justify-center rounded-2xl border border-[var(--admin-primary-200)] bg-[var(--admin-primary-50)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-primary)] transition hover:bg-[var(--admin-primary-100)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}
