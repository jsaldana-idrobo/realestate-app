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

const isServer = typeof window === "undefined";

// En servidor vamos directo al servicio interno + prefijo /api/v1 (SSR no usa rewrites)
// En cliente usamos el proxy de Next (/backend), que reescribe a /api/v1
const API_BASE = isServer
  ? (process.env.API_URL ?? "http://api:8080") + "/api/v1"
  : "/backend";

// CONSTRUCCIÓN DE URL SIN TEMPLATE LITERALS ANIDADOS
export function buildURL(
  path: string,
  params?: Record<string, string | number | undefined>
) {
  // normaliza los slashes
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const p = path.startsWith("/") ? path : "/" + path;

  const qs = new URLSearchParams();
  if (params) {
    for (const k in params) {
      const v = params[k];
      if (v !== undefined && v !== null && String(v).length > 0) {
        qs.set(k, String(v));
      }
    }
  }
  const query = qs.toString();
  return base + p + (query ? "?" + query : "");
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message?: string) {
    super(message || "HTTP " + status);
    this.name = "HttpError";
    this.status = status;
  }
}

// Rechaza SIEMPRE con Error (S6671)
async function http<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(input, { cache: "no-store", ...init });
    if (!res.ok) throw new HttpError(res.status, "HTTP " + res.status);
    return (await res.json()) as T;
  } catch (err: unknown) {
    // Normaliza AbortError también a Error
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request aborted");
    }
    if (err instanceof Error) throw err;
    throw new Error("Unknown error: " + String(err));
  }
}

export async function getProperties(params: Params) {
  return http(buildURL("/properties", params));
}

export async function getProperty(id: string) {
  return http(buildURL("/properties/" + encodeURIComponent(id)));
}
