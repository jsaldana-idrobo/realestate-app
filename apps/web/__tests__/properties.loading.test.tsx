import Loading from "@/app/properties/loading";
import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

describe("properties/loading (skeleton)", () => {
  it("renderiza el contenedor y la grilla de headers + 6 cards", () => {
    const { container } = render(<Loading />);

    // Contenedor principal
    const section = container.querySelector("section.space-y-4");
    expect(section).toBeTruthy();

    // 4 headers skeleton (son los únicos con h-10 + animate-pulse)
    const headers = container.querySelectorAll(".h-10.animate-pulse");
    expect(headers.length).toBe(4);

    // 6 tarjetas skeleton (div con ambas clases)
    const cards = container.querySelectorAll(".rounded-xl.border");
    expect(cards.length).toBe(6);

    // Cada tarjeta tiene exactamente un hijo directo animate-pulse (la "imagen")
    const directImageSkeletons = container.querySelectorAll(
      ".rounded-xl.border > .animate-pulse"
    );
    expect(directImageSkeletons.length).toBe(6);

    // (sanity) Dentro de cada card hay más placeholders (líneas), no validamos el número exacto
    // para no volver frágil el test si cambias el diseño.
    for (const card of Array.from(cards)) {
      const innerPulse = card.querySelectorAll(".animate-pulse");
      expect(innerPulse.length).toBeGreaterThanOrEqual(1);
    }
  });
});
