import RootLayout from "@/app/layout";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Mock del provider para que no afecte SSR del test
vi.mock("@/components/providers/tanstack-provider", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("RootLayout (SSR)", () => {
  it("incluye <header> con el título y renderiza los children dentro de <main>", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div data-testid="content">Hola</div>
      </RootLayout>
    );

    // Parseamos el HTML en un Document independiente (sin montar en el DOM del test)
    const doc = new window.DOMParser().parseFromString(html, "text/html");

    // Header y título
    const h1 = doc.querySelector("header h1");
    expect(h1?.textContent).toMatch(/real estate/i);

    // Children en <main>
    const main = doc.querySelector("main");
    expect(main).toBeTruthy();
    expect(main?.querySelector("[data-testid='content']")?.textContent).toBe(
      "Hola"
    );

    // Atributo lang en <html>
    const htmlEl = doc.querySelector("html");
    expect(htmlEl?.getAttribute("lang")).toBe("es");
  });
});
