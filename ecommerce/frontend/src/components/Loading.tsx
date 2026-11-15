/** Small centered spinner for page-level waits. */
export default function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="grid place-items-center py-16">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-ink" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Skeleton cards that mirror ProductCard's layout so nothing jumps when data arrives. */
export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div aria-busy="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-square !rounded-lg" />
          <div className="mt-2 flex justify-between gap-2">
            <div className="skeleton h-3.5 w-2/3" />
            <div className="skeleton h-3.5 w-10" />
          </div>
          <div className="skeleton mt-1.5 h-3 w-1/3" />
          <div className="skeleton mt-2 h-7 w-full" />
        </div>
      ))}
    </div>
  );
}

/** Inline error with a retry button, so a failed request is never a silently empty page. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="py-16 text-center">
      <p className="text-[13px] text-mute">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn-sm mt-3">
          Try again
        </button>
      )}
    </div>
  );
}
