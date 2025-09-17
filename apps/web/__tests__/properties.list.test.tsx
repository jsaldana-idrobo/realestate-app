import PropertiesList from "@/app/properties/_list";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Simplificamos los componentes de Card para no depender de estilos/DOM complejo
vi.mock("@/components/ui/card", () => ({
  __esModule: true,
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3>{children}</h3>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock API controlable por-test
const getProperties = vi.fn();
vi.mock("@/lib/api", () => ({
  getProperties: (...args: any[]) => getProperties(...args),
}));

// Helper para render con React Query (sin refetches molestos)
function renderWithRQ(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PropertiesList", () => {
  // ...

  it("Prev está deshabilitado en página 1", async () => {
    getProperties.mockResolvedValueOnce({
      items: [
        {
          propertyId: "a1",
          name: "Uno",
          addressProperty: "x",
          priceProperty: 1,
          image: "",
        },
      ],
      total: 2,
      page: 1,
      pageSize: 1,
      totalPages: 2,
    });

    renderWithRQ(
      <PropertiesList
        initialParams={{
          page: 1,
          pageSize: 1,
          sortBy: "createdAt",
          sortDir: "desc",
        }}
      />
    );

    await screen.findByText(/Uno/i);
    expect(screen.getByRole("button", { name: /prev/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
  });

  it("Next está deshabilitado en la última página", async () => {
    getProperties.mockResolvedValueOnce({
      items: [
        {
          propertyId: "b2",
          name: "Dos",
          addressProperty: "y",
          priceProperty: 2,
          image: "",
        },
      ],
      total: 2,
      page: 2,
      pageSize: 1,
      totalPages: 2,
    });

    renderWithRQ(
      <PropertiesList
        initialParams={{
          page: 2,
          pageSize: 1,
          sortBy: "createdAt",
          sortDir: "desc",
        }}
      />
    );

    await screen.findByText(/Dos/i);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /prev/i })).not.toBeDisabled();
  });
});
