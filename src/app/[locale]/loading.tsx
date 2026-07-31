// Skeleton, bukan spinner (docs/phase-0/05_ROUTE_AND_PRIORITY_MAP.md §5).
export default function Loading() {
  return (
    <div className="mx-auto max-w-container px-5 py-20 sm:px-8 lg:px-12">
      <div className="space-y-4">
        <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-elevated" />
        <div className="h-5 w-1/3 animate-pulse rounded-full bg-elevated" />
        <div className="mt-8 space-y-3">
          <div className="h-4 w-full animate-pulse rounded-full bg-elevated" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-elevated" />
          <div className="h-4 w-4/6 animate-pulse rounded-full bg-elevated" />
        </div>
      </div>
    </div>
  )
}
