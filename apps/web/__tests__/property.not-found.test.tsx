import NotFound from "@/app/properties/[id]/not-found";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

describe("NotFound (/properties/[id]/not-found)", () => {
  it("muestra mensaje y link de regreso", () => {
    render(<NotFound />);
    expect(screen.getByText(/propiedad no encontrada/i)).toBeInTheDocument();
    const back = screen.getByRole("link", { name: /volver al listado/i });
    expect(back).toBeInTheDocument();
    expect(back).toHaveAttribute("href", "/properties");
  });
});
