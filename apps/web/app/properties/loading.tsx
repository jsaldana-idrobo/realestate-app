const HEADER_KEYS = ["header-1", "header-2", "header-3", "header-4"] as const;
const CARD_KEYS = ["lc-1", "lc-2", "lc-3", "lc-4", "lc-5", "lc-6"] as const;

export default function Loading() {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {HEADER_KEYS.map((key) => (
          <div key={key} className="h-10 animate-pulse rounded-md bg-muted" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARD_KEYS.map((key) => (
          <div key={key} className="overflow-hidden rounded-xl border">
            <div className="aspect-[16/9] animate-pulse bg-muted" />
            <div className="space-y-2 p-4">
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
