// apps/web/__tests__/home.redirect.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";

// 1) Mock del módulo antes de importar la página
vi.mock("next/navigation", () => {
  return { redirect: vi.fn() };
});

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules(); // asegura que futuros imports no reutilicen el cache
});

describe("Home page redirect", () => {
  it("llama a redirect('/properties')", async () => {
    // 2) Importa la página DESPUÉS del mock
    const { default: Home } = await import("@/app/page");

    // 3) Ejecuta el componente (server) -> en nuestro mock solo registra la llamada
    Home();

    // 4) Obtén la función mockeada y valida
    const { redirect } = await import("next/navigation");
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith("/properties");
  });
});
