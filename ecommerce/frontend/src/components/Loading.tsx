/** Centered spinner for page-level waits. */
export default function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="grid min-h-[50vh] place-items-center py-24">
      <div className="h-7 w-7 animate-[spin_0.8s_linear_infinite] rounded-full border-2 border-fg/30 border-t-accentfg" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Skeleton tiles that mirror ProductCard so nothing jumps when data arrives. */
export function ProductGridSkeleton({ count = 8, className = 'grid-cols-2 lg:grid-cols-4' }: { count?: number; className?: string }) {
  return (
    <div aria-busy="true" className={`grid border-l border-t border-dotted border-fg/50 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-r border-dotted border-fg/50">
          <div className="skeleton aspect-[4/5]" />
          <div className="space-y-2 p-4">
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-5 w-4/5" />
            <div className="skeleton h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Inline error with retry, so a failed request is never a silently empty page. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="py-20 text-center">
      <p className="font-mono text-[13px]">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="pill pill-sm mt-5">
          Try again
        </button>
      )}
    </div>
  );
}
