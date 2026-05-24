/**
 * Homepage skeleton loader.
 *
 * Shown by Next.js while the page is being rendered or while server-side
 * data fetches resolve. Avoids the blank-screen-then-flash that hurts
 * perceived performance.
 *
 * Matches the layout structure of page.tsx so users see content shape
 * instantly even before pixels arrive.
 */
export default function HomeLoading() {
  return (
    <div className="bg-white min-h-screen animate-pulse">
      {/* Top bar */}
      <div className="bg-slate-900 h-8" />

      {/* Main nav */}
      <div className="bg-white border-b border-slate-200 h-[68px]" />

      {/* Hero */}
      <div className="bg-slate-50 px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 mb-8">
            <div>
              <div className="h-6 w-48 bg-slate-200 rounded-full mb-5" />
              <div className="h-12 lg:h-16 bg-slate-200 rounded mb-3" />
              <div className="h-12 lg:h-16 w-3/4 bg-slate-200 rounded mb-5" />
              <div className="h-5 bg-slate-200 rounded mb-2 max-w-md" />
              <div className="h-5 bg-slate-200 rounded max-w-sm" />
            </div>
            <div className="bg-white rounded-2xl border-2 border-slate-200 h-[280px]" />
          </div>
          <div className="bg-white rounded-2xl border-2 border-slate-200 h-[200px]" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 rounded-xl overflow-hidden mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white h-[100px]" />
            ))}
          </div>
        </div>
      </div>

      {/* Inventory grid */}
      <div className="px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-slate-200 rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="aspect-[16/10] bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-20 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
