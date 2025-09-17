import { render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// --- Mocks --- //

// Mock de la API: verificaremos que se llame con los params normalizados
const getPropertiesMock = vi.fn().mockResolvedValue({
  items: [],
  total: 0,
  page: 1,
  pageSize: 12,
});
vi.mock("@/lib/api", () => ({
  getProperties: getPropertiesMock,
}));

// Mock de TanStack Query: passthrough + QueryClient con prefetchQuery que ejecuta queryFn
const prefetchSpy = vi.fn(async (opts: any) => {
  if (opts?.queryFn) await opts.queryFn();
  return undefined;
});
const dehydrateSpy = vi.fn(() => ({ mocked: true }));

vi.mock("@tanstack/react-query", () => {
  const QueryClient = vi.fn().mockImplementation(() => ({
    prefetchQuery: prefetchSpy,
  }));
  const HydrationBoundary = ({ children }: any) => <>{children}</>;
  return {
    QueryClient,
    HydrationBoundary,
    dehydrate: dehydrateSpy,
  };
});

// Mock de los child components (para no traer client components reales)
vi.mock("@/app/properties/_filters", () => ({
  __esModule: true,
  default: () => <div data-testid="filters">FILTERS</div>,
}));
vi.mock("@/app/properties/_list", () => ({
  __esModule: true,
  default: ({ initialParams }: { initialParams: unknown }) => (
    <div data-testid="list">{JSON.stringify(initialParams)}</div>
  ),
}));

afterEach(() => {
  vi.clearAllMocks();
});

// --- Helpers ---
function parseListParams() {
  const el = screen.getByTestId("list");
  const txt = el.textContent || "{}";
  return JSON.parse(txt);
}

// --- Tests ---
describe("PropertiesPage (server page)", () => {
  it("normaliza searchParams y prefetchQuery con defaults", async () => {
    // Importamos la página DESPUÉS de preparar mocks
    const { default: PropertiesPage } = await import("@/app/properties/page");

    // searchParams vacío (Promise, como exige Next 15)
    const searchParams = Promise.resolve({} as Record<string, string>);

    // Ejecutamos la server page (async)
    const element = await PropertiesPage({ searchParams });

    // Renderizamos el resultado (no hay <html>, solo <section> con mocks)
    render(element as any);

    // Verifica que _list recibió defaults
    const p = parseListParams();
    expect(p).toEqual({
      name: undefined,
      address: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      page: 1,
      pageSize: 12,
      sortBy: "createdAt",
      sortDir: "desc",
    });

    // dehydrate se llamó
    expect(dehydrateSpy).toHaveBeenCalled();

    // prefetchQuery se llamó y ejecutó queryFn -> getProperties llamado con defaults
    expect(prefetchSpy).toHaveBeenCalledTimes(1);
    expect(getPropertiesMock).toHaveBeenCalledWith(p);
  });

  it("usa los searchParams y castea números/arrays correctamente", async () => {
    const { default: PropertiesPage } = await import("@/app/properties/page");

    // Mezcla de valores, incluyendo arrays y strings que deben castearse
    const sp = {
      name: "park",
      address: ["Springfield", "Shelbyville"], // debe tomar el primero
      minPrice: "200000",
      maxPrice: "500000",
      page: "2",
      pageSize: "6",
      sortBy: "price",
      sortDir: "asc",
    } as unknown as Record<string, string | string[]>;

    const searchParams = Promise.resolve(sp);

    const element = await PropertiesPage({ searchParams });
    render(element as any);

    const p = parseListParams();
    expect(p).toEqual({
      name: "park",
      address: "Springfield",
      minPrice: 200000,
      maxPrice: 500000,
      page: 2,
      pageSize: 6,
      sortBy: "price",
      sortDir: "asc",
    });

    // Aseguramos que prefetchQuery ejecutó el queryFn con estos params
    expect(prefetchSpy).toHaveBeenCalledTimes(1);
    expect(getPropertiesMock).toHaveBeenCalledWith(p);
  });

  it("aplica defaults cuando los números no son válidos", async () => {
    const { default: PropertiesPage } = await import("@/app/properties/page");

    const sp = {
      page: "abc", // inválido -> 1
      pageSize: "", // vacío -> 12
      minPrice: "", // -> undefined
      maxPrice: null, // -> undefined (tras normalizar)
      sortDir: "weird", // -> "desc" (fallback por tipo)
    } as unknown as Record<string, string>;

    const searchParams = Promise.resolve(sp);

    const element = await PropertiesPage({ searchParams });
    render(element as any);

    const p = parseListParams();
    expect(p).toEqual({
      name: undefined,
      address: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      page: 1,
      pageSize: 12,
      sortBy: "createdAt",
      sortDir: "desc",
    });

    expect(getPropertiesMock).toHaveBeenCalledWith(p);
  });
});
