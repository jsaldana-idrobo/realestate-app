// apps/web/__tests__/error.boundary.test.tsx
import ErrorBoundary from "@/app/properties/error"; // ajusta la ruta si aplica
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  // silencia SIEMPRE console.error en esta suite
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
  vi.clearAllMocks();
});

describe("ErrorBoundary", () => {
  it("muestra el mensaje y registra el error en console.error", () => {
    const err = new Error("boom!");
    const reset = vi.fn();

    render(<ErrorBoundary error={err} reset={reset} />);

    expect(
      screen.getByRole("heading", {
        name: /algo fue mal en esta página/i,
        level: 2,
      })
    ).toBeInTheDocument();

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(err);
  });

  it("al hacer clic en 'Reintentar' invoca reset()", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();

    render(<ErrorBoundary error={new Error("kaboom")} reset={reset} />);

    await user.click(screen.getByRole("button", { name: /reintentar/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
