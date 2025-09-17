"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Slider from "@/components/ui/slider";
import { getProperties } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import { useDebounce } from "@/lib/use-debounce";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const MIN = 0;
const MAX = 1_500_000;
const STEP = 10_000;

export default function FiltersBar() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const [, startTransition] = useTransition();

  // --- estado local (desde URL) ---
  const [name, setName] = useState(sp.get("name") ?? "");
  const [address, setAddress] = useState(sp.get("address") ?? "");
  const [sortBy, setSortBy] = useState(sp.get("sortBy") ?? "createdAt");
  const [sortDir, setSortDir] = useState(sp.get("sortDir") ?? "desc");
  const [pageSize, setPageSize] = useState(sp.get("pageSize") ?? "12");

  const initialMin = sp.get("minPrice")
    ? Math.max(MIN, Math.min(MAX, Number(sp.get("minPrice"))))
    : MIN;
  const initialMax = sp.get("maxPrice")
    ? Math.max(MIN, Math.min(MAX, Number(sp.get("maxPrice"))))
    : MAX;
  const [range, setRange] = useState<[number, number]>([
    initialMin,
    initialMax,
  ]); // slider UI
  const [minPriceInput, setMinPriceInput] = useState(String(initialMin));
  const [maxPriceInput, setMaxPriceInput] = useState(String(initialMax));

  // debounce para entradas de texto/selector
  const dName = useDebounce(name);
  const dAddress = useDebounce(address);
  const dSortBy = useDebounce(sortBy);
  const dSortDir = useDebounce(sortDir);
  const dPageSize = useDebounce(pageSize);

  // función única para prefetch + navegación
  async function prefetchAndReplace(
    params: URLSearchParams,
    objForQueryKey: Record<string, any>
  ) {
    // normaliza a undefined los vacíos
    const nextParamsObj = {
      name: objForQueryKey.name || undefined,
      address: objForQueryKey.address || undefined,
      minPrice:
        objForQueryKey.minPrice !== undefined
          ? Number(objForQueryKey.minPrice)
          : undefined,
      maxPrice:
        objForQueryKey.maxPrice !== undefined
          ? Number(objForQueryKey.maxPrice)
          : undefined,
      page: 1,
      pageSize: objForQueryKey.pageSize ? Number(objForQueryKey.pageSize) : 12,
      sortBy: objForQueryKey.sortBy || "createdAt",
      sortDir: (objForQueryKey.sortDir as "asc" | "desc") || "desc",
    };

    await qc.prefetchQuery({
      queryKey: qk.properties(nextParamsObj),
      queryFn: () => getProperties(nextParamsObj),
    });

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  // aplica cambios “debounced” (name/address/sort/pageSize)
  useEffect(() => {
    const params = new URLSearchParams(sp.toString());
    const setOrDel = (k: string, v?: string | null) =>
      v?.length ? params.set(k, v) : params.delete(k);

    setOrDel("name", dName);
    setOrDel("address", dAddress);
    setOrDel("sortBy", dSortBy);
    setOrDel("sortDir", dSortDir);
    setOrDel("pageSize", dPageSize);
    params.set("page", "1");

    prefetchAndReplace(params, {
      name: dName,
      address: dAddress,
      minPrice: params.get("minPrice") ?? undefined,
      maxPrice: params.get("maxPrice") ?? undefined,
      pageSize: dPageSize,
      sortBy: dSortBy,
      sortDir: dSortDir,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dName, dAddress, dSortBy, dSortDir, dPageSize]);

  // aplica cambios de precio desde el slider/inputs
  const applyPriceRange = async (min: number, max: number) => {
    const params = new URLSearchParams(sp.toString());
    const clamp = (n: number) =>
      Math.max(MIN, Math.min(MAX, Math.round(n / STEP) * STEP));
    const vmin = clamp(min);
    const vmax = clamp(max);
    if (vmin > vmax) return;

    if (vmin <= MIN) params.delete("minPrice");
    else params.set("minPrice", String(vmin));
    if (vmax >= MAX) params.delete("maxPrice");
    else params.set("maxPrice", String(vmax));

    params.set("page", "1");

    await prefetchAndReplace(params, {
      name,
      address,
      minPrice: params.get("minPrice") ?? undefined,
      maxPrice: params.get("maxPrice") ?? undefined,
      pageSize,
      sortBy,
      sortDir,
    });
  };

  // chips activos
  const chips = useMemo(() => {
    const arr: Array<{ key: string; label: string; onClear: () => void }> = [];
    if (name.trim())
      arr.push({
        key: "name",
        label: `Name: ${name}`,
        onClear: () => setName(""),
      });
    if (address.trim())
      arr.push({
        key: "address",
        label: `Address: ${address}`,
        onClear: () => setAddress(""),
      });

    const [minV, maxV] = range;
    if (minV > MIN) {
      arr.push({
        key: "minPrice",
        label: `Min ${CURRENCY.format(minV)}`,
        onClear: () => {
          setRange([MIN, range[1]]);
          setMinPriceInput(String(MIN));
          applyPriceRange(MIN, range[1]);
        },
      });
    }
    if (maxV < MAX) {
      arr.push({
        key: "maxPrice",
        label: `Max ${CURRENCY.format(maxV)}`,
        onClear: () => {
          setRange([range[0], MAX]);
          setMaxPriceInput(String(MAX));
          applyPriceRange(range[0], MAX);
        },
      });
    }
    if (sortBy !== "createdAt")
      arr.push({
        key: "sortBy",
        label: `Sort: ${sortBy}`,
        onClear: () => setSortBy("createdAt"),
      });
    if (sortDir !== "desc")
      arr.push({
        key: "sortDir",
        label: `Dir: ${sortDir}`,
        onClear: () => setSortDir("desc"),
      });
    if (pageSize !== "12")
      arr.push({
        key: "pageSize",
        label: `Page size: ${pageSize}`,
        onClear: () => setPageSize("12"),
      });
    return arr;
  }, [name, address, range, sortBy, sortDir, pageSize]);

  return (
    <section className="space-y-3">
      {/* Filtros principales */}
      <form className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input
          name="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          name="address"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        {/* Slider de precio (ocupa 2 columnas en desktop) */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{CURRENCY.format(range[0])}</span>
            <span>{CURRENCY.format(range[1])}</span>
          </div>
          <Slider
            min={MIN}
            max={MAX}
            step={STEP}
            value={range}
            onValueChange={(v) => {
              const next: [number, number] = [v[0] ?? MIN, v[1] ?? MAX];
              setRange(next);
              setMinPriceInput(String(next[0]));
              setMaxPriceInput(String(next[1]));
            }}
            onValueCommit={(v) => applyPriceRange(v[0] ?? MIN, v[1] ?? MAX)}
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              className="w-full"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              onBlur={() => {
                const v = Number(minPriceInput || MIN);
                const next: [number, number] = [
                  Math.max(MIN, Math.min(v, range[1])),
                  range[1],
                ];
                setRange(next);
                setMinPriceInput(String(next[0]));
                applyPriceRange(next[0], next[1]);
              }}
              placeholder="Min price"
            />
            <span className="text-sm text-muted-foreground">—</span>
            <Input
              type="number"
              inputMode="numeric"
              className="w-full"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              onBlur={() => {
                const v = Number(maxPriceInput || MAX);
                const next: [number, number] = [
                  range[0],
                  Math.min(MAX, Math.max(v, range[0])),
                ];
                setRange(next);
                setMaxPriceInput(String(next[1]));
                applyPriceRange(next[0], next[1]);
              }}
              placeholder="Max price"
            />
            <Button
              type="button"
              onClick={() => {
                // estado UI
                setName("");
                setAddress("");
                setSortBy("createdAt");
                setSortDir("desc");
                setPageSize("12");
                setRange([MIN, MAX]);
                setMinPriceInput(String(MIN));
                setMaxPriceInput(String(MAX));

                // navegación + prefetch en una sola pasada
                const params = new URLSearchParams();
                params.set("sortBy", "createdAt");
                params.set("sortDir", "desc");
                params.set("pageSize", "12");
                params.set("page", "1");

                prefetchAndReplace(params, {
                  name: undefined,
                  address: undefined,
                  minPrice: undefined,
                  maxPrice: undefined,
                  page: 1,
                  pageSize: 12,
                  sortBy: "createdAt",
                  sortDir: "desc",
                });
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Orden y page size */}
        <div className="md:col-span-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <label className="flex items-center gap-2">
            <span>Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border bg-transparent p-2"
            >
              <option value="createdAt">Created</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span>Dir</span>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
              className="rounded-md border bg-transparent p-2"
            >
              <option value="desc">desc</option>
              <option value="asc">asc</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span>Page size</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              className="rounded-md border bg-transparent p-2"
            >
              <option value="6">6</option>
              <option value="12">12</option>
              <option value="20">20</option>
            </select>
          </label>
        </div>
      </form>

      {/* Chips de filtros activos */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs"
              onClick={c.onClear}
              aria-label={`Clear ${c.key}`}
            >
              {c.label}
              <span aria-hidden>×</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
