export function AssignmentSkeleton() {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-4 animate-pulse">
        {/* Header bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3 w-full">
            <div className="flex gap-2">
              <div className="h-4 w-12 bg-slate-200 rounded-lg"></div>
              <div className="h-4 w-20 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="h-6 w-3/4 bg-slate-200 rounded-md"></div>
            <div className="h-3 w-1/2 bg-slate-200 rounded-md"></div>
          </div>
          <div className="h-6 w-24 bg-slate-200 rounded-full shrink-0"></div>
        </div>

        {/* Description */}
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full bg-slate-200 rounded-md"></div>
          <div className="h-3 w-5/6 bg-slate-200 rounded-md"></div>
          <div className="h-3 w-4/6 bg-slate-200 rounded-md"></div>
        </div>

        {/* Files section */}
        <div className="pt-4 border-t border-slate-100">
          <div className="h-3 w-32 bg-slate-200 rounded-md mb-3"></div>
          <div className="flex gap-2">
            <div className="h-8 w-32 bg-slate-200 rounded-xl"></div>
            <div className="h-8 w-24 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="h-4 w-40 bg-slate-200 rounded-md"></div>
        <div className="h-9 w-36 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
}
