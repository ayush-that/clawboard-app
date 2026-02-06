export default function Loading() {
  return (
    <div className="flex h-dvh flex-col">
      <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
        <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
      </header>
      <div className="flex flex-1 flex-col items-center gap-4 px-4 pt-20">
        <div className="flex w-full max-w-3xl flex-col gap-4">
          <div className="flex gap-3">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
