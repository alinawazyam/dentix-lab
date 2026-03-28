'use client';

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-white/10 bg-white/5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 bg-white/10 rounded flex-1 animate-pulse" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-white/5">
          <div className="h-4 bg-white/5 rounded w-24 animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-32 animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-20 animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-16 animate-pulse" />
          <div className="h-6 bg-white/5 rounded-full w-20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="h-4 bg-white/10 rounded w-16 mb-2 animate-pulse" />
          <div className="h-8 bg-white/10 rounded w-20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <CardSkeleton count={5} />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-64 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
        <div className="h-64 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
      </div>
    </div>
  );
}

export function InvoiceSkeleton() {
  return (
    <div className="space-y-6">
      <CardSkeleton count={5} />
      <TableSkeleton rows={10} />
    </div>
  );
}

export function AppointmentSkeleton() {
  return (
    <div className="space-y-6">
      <CardSkeleton count={4} />
      <TableSkeleton rows={8} />
    </div>
  );
}
