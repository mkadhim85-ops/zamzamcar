/**
 * Car detail page loading skeleton.
 * Matches the actual layout structure so users see content shape immediately.
 */
export default function CarDetailLoading() {
  return (
    <div className="bg-white min-h-screen animate-pulse">
      {/* Top bar */}
      <div className="bg-slate-900 h-8" />
      {/* Main nav */}
      <div className="bg-white border-b border-slate-200 h-[68px]" />
      {/* Breadcrumbs */}
      <div className="bg-slate-50 border-b border-slate-200 h-12" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-10">
          {/* Gallery skeleton */}
          <div className="space-y-3">
            <div className="aspect-[16/10] bg-slate-100 rounded-2xl" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-20 h-16 bg-slate-100 rounded-md" />
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/2" />
            <div className="flex gap-2">
              <div className="h-7 w-24 bg-slate-200 rounded-md" />
              <div className="h-7 w-24 bg-slate-200 rounded-md" />
            </div>
            <div className="h-32 bg-slate-100 rounded-2xl" />
            <div className="h-48 bg-slate-100 rounded-2xl" />
            <div className="h-14 bg-emerald-100 rounded-lg" />
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-10">
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-slate-100 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="h-96 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
