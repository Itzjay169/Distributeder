import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header skeleton */}
      <div className="h-10 bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-slate-900/80 skeleton-shimmer" />
      <div className="h-16 bg-slate-900 border-b border-slate-800 skeleton-shimmer" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-6 sm:space-y-8 flex-1">
        {/* Hero section skeleton */}
        <div className="h-40 sm:h-48 bg-slate-200/60 rounded-3xl skeleton-shimmer" />

        {/* Filter bar skeleton */}
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`filter-${i}`}
              className="h-8 rounded-full skeleton-shimmer bg-slate-200/60"
              style={{ width: `${60 + i * 15}px`, animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 space-y-4 shadow-sm skeleton-shimmer"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="aspect-[4/3] bg-slate-100 rounded-xl sm:rounded-2xl" />
              <div className="space-y-2.5">
                <div className="h-4 bg-slate-100 rounded-lg w-4/5" />
                <div className="h-3 bg-slate-100 rounded-lg w-3/5" />
                <div className="h-3 bg-slate-100 rounded-lg w-2/5" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 bg-slate-100 rounded-xl flex-1" />
                <div className="h-9 w-9 bg-slate-100 rounded-xl shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
