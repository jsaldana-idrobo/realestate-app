// apps/web/__tests__/property.detail.test.tsx
import PropertyDetail from "@/app/properties/[id]/page";
import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock API
const getProperty = vi.fn();
vi.mock("@/lib/api", () => ({
  getProperty: (...args: any[]) => getProperty(...args),
}));

// Helpers de params/searchParams (siguen el tipo de tu page)
const params = (id: string) => Promise.resolve({ id });
const sp = (obj?: Record<string, string>) => Promise.resolve(obj ?? {});

beforeEach(() => {
  vi.clearAllMocks();
});

// Utilidad: renderizar el resultado del server component
async function renderRSC(
  props: Parameters<typeof PropertyDetail>[0]
): Promise<void> {
  // PropertyDetail es async → devuelve JSX → lo renderizamos
  const ui = (await PropertyDetail(
    props as any
  )) as unknown as React.ReactElement;
  render(ui);
}

describe("PropertyDetail (/properties/[id])", () => {
  it("muestra nombre, dirección, precio e imagen con alt", async () => {
    const ITEM = {
      propertyId: "p-1",
      name: "Park View Apartment",
      addressProperty: "123 Main St",
      priceProperty: 250000,
      idOwner: "o1",
      image: "https://example.com/img.jpg",
    };
    getProperty.mockResolvedValueOnce(ITEM);

    await renderRSC({
      params: params("p-1"),
      searchParams: sp(),
    } as any);

    // Título, dirección, precio
    expect(
      screen.getByRole("heading", { name: /park view apartment/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/123 main st/i)).toBeInTheDocument();
    expect(screen.getByText(/\$250,000/)).toBeInTheDocument();

    // Imagen: ahora es <img alt="Imagen de {name}">
    const img = screen.getByAltText(/imagen de park view apartment/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", ITEM.image);
  });

  it("el enlace ← Volver preserva los query params del listado", async () => {
    const ITEM = {
      propertyId: "p-2",
      name: "Modern Villa",
      addressProperty: "12 Ocean Dr",
      priceProperty: 980000,
      idOwner: "o2",
      image: "",
    };
    getProperty.mockResolvedValueOnce(ITEM);

    const qs = {
      name: "Park",
      sortBy: "createdAt",
      sortDir: "desc",
      page: "2",
    };

    await renderRSC({
      params: params("p-2"),
      searchParams: sp(qs),
    } as any);

    const back = screen.getByRole("link", { name: /volver/i });
    expect(back).toBeInTheDocument();

    const href = (back as HTMLAnchorElement).getAttribute("href")!;
    // Debe volver a /properties conservando los QS
    expect(href.startsWith("/properties?")).toBe(true);

    const url = new URL(`http://local${href}`);
    expect(url.searchParams.get("name")).toBe("Park");
    expect(url.searchParams.get("sortBy")).toBe("createdAt");
    expect(url.searchParams.get("sortDir")).toBe("desc");
    expect(url.searchParams.get("page")).toBe("2");
  });
});
