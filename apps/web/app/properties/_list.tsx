"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProperties } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// ---------- Tipos ----------
type PropertyListItem = {
  propertyId: string;
  name: string;
  addressProperty: string;
  priceProperty: number;
  image?: string | null;
};

type PropertiesListResponse = {
  items: PropertyListItem[];
  page: number;
  totalPages: number;
};

type Params = {
  name?: string;
  address?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

// ---------- Componente ----------
export default function PropertiesList({
  initialParams,
}: {
  readonly initialParams: Params;
}) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params: Params = {
    name: sp.get("name") ?? initialParams.name,
    address: sp.get("address") ?? initialParams.address,
    minPrice: sp.get("minPrice")
      ? Number(sp.get("minPrice"))
      : initialParams.minPrice,
    maxPrice: sp.get("maxPrice")
      ? Number(sp.get("maxPrice"))
      : initialParams.maxPrice,
    page: sp.get("page") ? Number(sp.get("page")) : initialParams.page ?? 1,
    pageSize: sp.get("pageSize")
      ? Number(sp.get("pageSize"))
      : initialParams.pageSize ?? 12,
    sortBy: sp.get("sortBy") ?? initialParams.sortBy ?? "createdAt",
    sortDir:
      (sp.get("sortDir") as "asc" | "desc") ?? initialParams.sortDir ?? "desc",
  };

  const query = useQuery<PropertiesListResponse>({
    queryKey: qk.properties(params),
    queryFn: () => getProperties(params),
    staleTime: 5000,
  });

  if (query.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (query.isError) {
    return <p className="text-sm text-red-600">Error loading properties.</p>;
  }

  const data = query.data!;
  const setPage = (page: number) => {
    const p = new URLSearchParams(sp.toString());
    p.set("page", String(page));
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };

  return (
    <>
      {data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No results.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((p: PropertyListItem) => {
            const imgSrc = p?.image?.trim().length
              ? p.image
              : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'/>";

            return (
              <Card key={p.propertyId} data-testid="card">
                <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                  <img
                    src={imgSrc}
                    alt={`Imagen de ${p.name}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>{p.addressProperty}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">
                    ${p.priceProperty.toLocaleString()}
                  </div>
                  <Link
                    className="mt-2 inline-block text-primary underline"
                    href={`/properties/${encodeURIComponent(
                      p.propertyId
                    )}?${sp.toString()}`}
                  >
                    Ver detalle
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <nav className="mt-4 flex items-center gap-3">
        <button
          className="text-sm underline disabled:opacity-50"
          onClick={() => setPage(Math.max(1, (data.page ?? 1) - 1))}
          disabled={(data.page ?? 1) <= 1}
        >
          ← Prev
        </button>
        <span className="text-sm text-muted-foreground">
          Página {data.page} / {data.totalPages}
        </span>
        <button
          className="text-sm underline disabled:opacity-50"
          onClick={() =>
            setPage(Math.min(data.totalPages, (data.page ?? 1) + 1))
          }
          disabled={(data.page ?? 1) >= data.totalPages}
        >
          Next →
        </button>
      </nav>
    </>
  );
}
