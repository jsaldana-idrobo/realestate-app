// apps/web/__tests__/filters.bar.test.tsx
import FiltersBar from "@/app/properties/_filters";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as NextNav from "next/navigation";
import React from "react";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// -------------------------------------------------------------
// Mocks
// -------------------------------------------------------------

// Evita updates internos y warnings de act de Radix Slider
vi.mock("@/components/ui/slider", () => ({
  __esModule: true,
  default: () => <div data-testid="slider" />,
}));

// Debounce instantáneo para acelerar y evitar sleeps
vi.mock("@/lib/use-debounce", () => ({
  useDebounce: (v: any) => v,
}));

// Mock API controlable
const getProperties = vi.fn();
vi.mock("@/lib/api", () => ({
  getProperties: (...args: any[]) => getProperties(...args),
}));

// Silencia solo el warning “not wrapped in act” (y cumple S6551)
let errorSpy: ReturnType<typeof vi.spyOn>;
const originalErrorFn: (...data: unknown[]) => void = console.error;
function consoleArgsToText(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === "string") return a;
      if (a instanceof Error) return `${a.name}: ${a.message}`;
      if (a && typeof a === "object") {
        try {
          return JSON.stringify(a);
        } catch {
          return "[object]";
        }
      }
      return String(a);
    })
    .join(" ");
}
beforeAll(() => {
  errorSpy = vi
    .spyOn(console, "error")
    .mockImplementation((...args: unknown[]) => {
      const text = consoleArgsToText(args);
      if (text.includes("not wrapped in act")) return;
      originalErrorFn(...args);
    });
});
afterAll(() => {
  errorSpy.mockRestore();
});

// -------------------------------------------------------------
// Utils
// -------------------------------------------------------------

function makeClient(opts?: QueryClientConfig) {
  const base: QueryClientConfig = {
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
  };

  // merge seguro (deepish) para defaultOptions.queries
  const merged: QueryClientConfig = {
    ...base,
    ...(opts ?? {}),
    defaultOptions: {
      ...base.defaultOptions,
      ...(opts?.defaultOptions ?? {}),
      queries: {
        ...base.defaultOptions?.queries,
        ...(opts?.defaultOptions?.queries ?? {}),
      },
    },
  };

  return new QueryClient(merged);
}

function renderWithRQ(ui: React.ReactNode) {
  const client = makeClient();
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

// Fuerza refetch (staleTime: 0) para el test de Reset
function renderWithRQFresh(ui: React.ReactNode) {
  const client = makeClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: true,
      },
    },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const parse = (urlLike: string) => new URL(`http://local${urlLike}`);

beforeEach(() => {
  vi.clearAllMocks();
  // Responder a TODAS las llamadas (no solo la primera)
  getProperties.mockResolvedValue({});
});

// -------------------------------------------------------------
// Tests
// -------------------------------------------------------------

describe("FiltersBar (debounced filters + prefetch + replace)", () => {
  it("al escribir Name hace prefetch y navega con name + defaults + page=1", async () => {
    renderWithRQ(<FiltersBar />);

    await sleep(0); // deja pasar el primer effect
    vi.clearAllMocks();

    const user = userEvent.setup();
    const name = screen.getByPlaceholderText(/name/i);
    // con debounce mockeado => varias replaces (uno por input)
    await user.type(name, "Park");

    const { replace } = NextNav.useRouter();
    const calls = (replace as any).mock.calls;
    expect(calls.length).toBeGreaterThan(0);

    const lastUrl = calls.at(-1)![0] as string;
    const u = parse(lastUrl);

    expect(u.pathname).toBe("/properties");
    expect(u.searchParams.get("name")).toBe("Park");
    expect(u.searchParams.get("sortBy")).toBe("createdAt");
    expect(u.searchParams.get("sortDir")).toBe("desc");
    expect(u.searchParams.get("pageSize")).toBe("12");
    expect(u.searchParams.get("page")).toBe("1");

    const lastArgs = (getProperties as any).mock.calls.at(-1)![0];
    expect(lastArgs).toEqual({
      name: "Park",
      address: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      page: 1,
      pageSize: 12,
      sortBy: "createdAt",
      sortDir: "desc",
    });
  });

  it("cambiar Page size a 20 actualiza ?pageSize=20&page=1 y prefetch con 20", async () => {
    renderWithRQ(<FiltersBar />);
    await sleep(0);
    vi.clearAllMocks();

    const user = userEvent.setup();
    const select = screen.getByLabelText(/page size/i);
    await user.selectOptions(select, "20");

    const { replace } = NextNav.useRouter();
    const url = (replace as any).mock.calls.at(-1)![0] as string;
    const u = parse(url);

    expect(u.searchParams.get("pageSize")).toBe("20");
    expect(u.searchParams.get("page")).toBe("1");

    const lastArgs = (getProperties as any).mock.calls.at(-1)![0];
    expect(lastArgs).toMatchObject({
      page: 1,
      pageSize: 20,
      sortBy: "createdAt",
      sortDir: "desc",
    });
  });

  it("cambiar Sort (price) y Dir (asc) actualiza la URL y hace prefetch", async () => {
    renderWithRQ(<FiltersBar />);
    await sleep(0);
    vi.clearAllMocks();

    const user = userEvent.setup();

    const sortBy = screen.getByLabelText(/sort by/i);
    await user.selectOptions(sortBy, "price");

    const sortDir = screen.getByLabelText(/^dir$/i);
    await user.selectOptions(sortDir, "asc");

    const { replace } = NextNav.useRouter();
    const lastUrl = (replace as any).mock.calls.at(-1)![0] as string;
    const u = parse(lastUrl);

    expect(u.searchParams.get("sortBy")).toBe("price");
    expect(u.searchParams.get("sortDir")).toBe("asc");
    expect(u.searchParams.get("page")).toBe("1");

    const lastArgs = (getProperties as any).mock.calls.at(-1)![0];
    expect(lastArgs).toMatchObject({
      sortBy: "price",
      sortDir: "asc",
      page: 1,
    });
  });

  it("al editar min/max (inputs) y blur, aplica clamp y navega con minPrice/maxPrice", async () => {
    renderWithRQ(<FiltersBar />);
    await sleep(0);
    vi.clearAllMocks();

    const user = userEvent.setup();

    const inputs = screen.getAllByPlaceholderText(/price/i);
    const minInput = inputs.find((el) =>
      (el as HTMLInputElement).placeholder?.toLowerCase().includes("min")
    ) as HTMLInputElement;
    const maxInput = inputs.find((el) =>
      (el as HTMLInputElement).placeholder?.toLowerCase().includes("max")
    ) as HTMLInputElement;

    await user.clear(minInput);
    await user.click(minInput); // enfoca
    await user.paste("100000"); // pega en el enfocado
    await user.tab(); // dispara onBlur si lo necesitas

    await user.clear(maxInput);
    await user.click(maxInput);
    await user.paste("500000");
    await user.tab();

    await sleep(0);

    const { replace } = NextNav.useRouter();
    const url = (replace as any).mock.calls.at(-1)![0] as string;
    const u = parse(url);

    expect(u.searchParams.get("minPrice")).toBe("100000");
    expect(u.searchParams.get("maxPrice")).toBe("500000");
    expect(u.searchParams.get("page")).toBe("1");

    const lastArgs = (getProperties as any).mock.calls.at(-1)![0];
    expect(lastArgs).toMatchObject({
      minPrice: 100000,
      maxPrice: 500000,
      page: 1,
      pageSize: 12,
      sortBy: "createdAt",
      sortDir: "desc",
    });
  });

  it("Reset limpia filtros, borra min/max en URL y restaura defaults", async () => {
    // Forzamos refetch en este test (staleTime: 0)
    renderWithRQFresh(<FiltersBar />);
    await sleep(0);
    vi.clearAllMocks();

    const user = userEvent.setup();

    // Ensuciamos estado
    const nameInput = screen.getByPlaceholderText(/name/i);
    await user.clear(nameInput);
    await user.click(nameInput);
    await user.paste("X");
    await user.selectOptions(screen.getByLabelText(/page size/i), "20");

    vi.clearAllMocks();

    // Click Reset -> puede hacer varias replaces; validamos la última
    await user.click(screen.getByRole("button", { name: /reset/i }));

    // deja pasar microtasks/efectos
    await sleep(50);

    const { replace } = NextNav.useRouter();
    const lastUrl = (replace as any).mock.calls.at(-1)![0] as string;
    const u = parse(lastUrl);

    // URL final con defaults
    expect(u.searchParams.get("name")).toBeNull();
    expect(u.searchParams.get("address")).toBeNull();
    expect(u.searchParams.get("minPrice")).toBeNull();
    expect(u.searchParams.get("maxPrice")).toBeNull();
    expect(u.searchParams.get("sortBy")).toBe("createdAt");
    expect(u.searchParams.get("sortDir")).toBe("desc");
    expect(u.searchParams.get("pageSize")).toBe("12");
    expect(u.searchParams.get("page")).toBe("1");

    // Y se hizo prefetch (staleTime: 0 obliga refetch)
    expect(getProperties).toHaveBeenCalled();
  });
});
