import { generateMetadata } from "@/app/properties/[id]/page";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getProperty = vi.fn();
vi.mock("@/lib/api", () => ({
  getProperty: (...args: any[]) => getProperty(...args),
}));

const params = (id: string) => Promise.resolve({ id });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PropertyDetail.generateMetadata", () => {
  it("devuelve título/descr dinámicos cuando la propiedad existe", async () => {
    getProperty.mockResolvedValueOnce({
      propertyId: "p-1",
      name: "Park View Apartment",
      addressProperty: "123 Main St",
      priceProperty: 250000,
      idOwner: "o1",
      image: "",
    });

    const meta = await generateMetadata({ params: params("p-1") } as any);
    expect(meta.title).toMatch(/Park View Apartment/i);
    expect(meta.description).toMatch(/123 Main St/);
    expect(meta.description).toMatch(/\$250,000/);
  });

  it("muestra metadata de 'no encontrada' si la API devuelve null", async () => {
    getProperty.mockResolvedValueOnce(null);

    const meta = await generateMetadata({ params: params("x") } as any);
    expect(meta.title).toMatch(/no encontrada/i);
  });

  it("si hay error inesperado, devuelve fallback", async () => {
    getProperty.mockRejectedValueOnce(new Error("boom"));

    const meta = await generateMetadata({ params: params("x") } as any);
    expect(meta.title).toMatch(/detalle/i);
  });
});
