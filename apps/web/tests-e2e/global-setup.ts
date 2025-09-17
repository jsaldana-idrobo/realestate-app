// apps/web/tests-e2e/global-setup.ts
import type { FullConfig } from "@playwright/test";

async function waitFor(
  url: string,
  { timeoutMs = 60_000, intervalMs = 1_000 } = {}
) {
  const start = Date.now();
  // @ts-ignore Node 18+ trae fetch global
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // sigue reintentando
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Timeout esperando ${url}`);
}

export default async function globalSetup(_config: FullConfig) {
  // La API debe estar corriendo por fuera (docker compose up api mongo)
  const probe =
    "http://localhost:8080/api/v1/properties?page=1&pageSize=1&sortBy=createdAt&sortDir=desc";
  await waitFor(probe, { timeoutMs: 90_000, intervalMs: 1500 });
}
