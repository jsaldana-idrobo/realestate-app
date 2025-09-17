import { getProperties } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import FiltersBar from "./_filters";
import PropertiesList from "./_list";

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

function spGet(sp: Record<string, string | string[] | undefined>, key: string) {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export default async function PropertiesPage({
  searchParams,
}: {
  readonly searchParams: SP;
}) {
  const sp = await searchParams;

  const name = spGet(sp, "name");
  const address = spGet(sp, "address");
  const minPrice = spGet(sp, "minPrice");
  const maxPrice = spGet(sp, "maxPrice");
  const page = Number(spGet(sp, "page") ?? "1") || 1;
  const pageSize = Number(spGet(sp, "pageSize") ?? "12") || 12;
  const sortByRaw = spGet(sp, "sortBy") ?? "createdAt";
  const sortBy = ["createdAt", "price", "name"].includes(sortByRaw)
    ? sortByRaw
    : "createdAt";

  const sortDirRaw = spGet(sp, "sortDir");
  const sortDir: "asc" | "desc" =
    sortDirRaw === "asc" || sortDirRaw === "desc" ? sortDirRaw : "desc";

  const params = {
    name: name || undefined,
    address: address || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    page,
    pageSize,
    sortBy,
    sortDir,
  };

  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: qk.properties(params),
    queryFn: () => getProperties(params),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <section className="space-y-4">
        <FiltersBar />
        <PropertiesList initialParams={params} />
      </section>
    </HydrationBoundary>
  );
}
