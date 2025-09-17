// apps/web/lib/api.ts
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

// En servidor usamos el backend absoluto; en cliente, ruta relativa (proxy de Next)
const API_BASE =
  typeof window === "undefined"
    ? process.env.API_URL ?? "http://localhost:8080"
    : "";

// Helper para construir URL sin templates anidados
export function buildURL(
  path: string,
  params?: Record<string, string | number | undefined>
) {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && String(v).length > 0) {
        qs.set(k, String(v));
      }
    }
  }
  const q = qs.toString();
  const url = API_BASE + path + (q ? "?" + q : "");
  return url;
}

export async function getProperties(params: Params) {
  const res = await fetch(buildURL("/api/v1/properties", params), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  // Asegura que nunca devolvemos undefined
  return json;
}

export async function getProperty(id: string) {
  const res = await fetch(
    buildURL(`/api/v1/properties/${encodeURIComponent(id)}`),
    { cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json;
}
