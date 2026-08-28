import { PenLine, FileText } from 'lucide-react';

// Single note card skeleton
function SkeletonCard() {
  return (
    <div className="bg-snap-card border border-snap-border rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="h-5 bg-snap-border rounded-md w-3/5" />
        <div className="h-4 w-4 bg-snap-border rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-snap-border rounded w-full" />
        <div className="h-3 bg-snap-border rounded w-4/5" />
        <div className="h-3 bg-snap-border rounded w-2/3" />
      </div>
      <div className="flex gap-2 mt-auto">
        <div className="h-5 w-12 bg-snap-border rounded-full" />
        <div className="h-5 w-16 bg-snap-border rounded-full" />
      </div>
      <div className="h-3 w-24 bg-snap-border rounded mt-1" />
    </div>
  );
}

export default function NoteSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
