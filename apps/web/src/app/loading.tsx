export default function Loading() {
  return (
    <div className="min-h-screen p-3 sm:p-6 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Bar Skeleton */}
        <div className="p-3.5 sm:p-4 rounded-2xl glass-card flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-200 dark:bg-brand-900/60" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 sm:w-44 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-3 w-48 sm:w-60 bg-slate-100 dark:bg-slate-800 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        {/* Hero / Main Card Skeleton */}
        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 glass-card space-y-4 animate-pulse">
          <div className="space-y-2 max-w-xl">
            <div className="h-3 w-28 bg-brand-100 dark:bg-brand-950 rounded-full" />
            <div className="h-6 sm:h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
          </div>

          {/* Cards Grid / Table Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 space-y-3 border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-6 w-24 bg-slate-300 dark:bg-slate-600 rounded-md" />
                  <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
