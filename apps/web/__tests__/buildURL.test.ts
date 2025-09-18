import { describe, expect, it, afterEach, vi } from "vitest";

const expectedBase = () =>
  typeof window === "undefined"
    ? (process.env.API_URL ?? "http://api:8080") + "/api/v1"
    : "/backend";

describe("buildURL", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("sin params -> path", async () => {
    const { buildURL } = await import("@/lib/api");
    expect(buildURL("/properties")).toBe(`${expectedBase()}/properties`);
  });

  it("con params -> query", async () => {
    const { buildURL } = await import("@/lib/api");
    const url = buildURL("/properties", {
      page: 1,
      pageSize: 12,
      sortBy: "createdAt",
      sortDir: "desc",
    });
    expect(url).toBe(
      `${expectedBase()}/properties?page=1&pageSize=12&sortBy=createdAt&sortDir=desc`
    );
  });

  it("omite undefined/vacíos", async () => {
    const { buildURL } = await import("@/lib/api");
    const url = buildURL("/x", { a: "", b: undefined, c: 0, d: "ok" });
    expect(url).toBe(`${expectedBase()}/x?c=0&d=ok`);
  });

  it("soporta modo servidor cuando window no existe", async () => {
    vi.stubGlobal("window", undefined);
    const { buildURL } = await import("@/lib/api");
    expect(buildURL("/p")).toBe(`${expectedBase()}/p`);
  });
});
