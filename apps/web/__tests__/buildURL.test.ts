import { buildURL } from "@/lib/api";
import { describe, expect, it } from "vitest";

describe("buildURL", () => {
  it("sin params -> path", () => {
    expect(buildURL("/api/v1/properties")).toBe("/api/v1/properties");
  });

  it("con params -> query", () => {
    const url = buildURL("/api/v1/properties", {
      page: 1,
      pageSize: 12,
      sortBy: "createdAt",
      sortDir: "desc",
    });
    expect(url).toBe(
      "/api/v1/properties?page=1&pageSize=12&sortBy=createdAt&sortDir=desc"
    );
  });

  it("omite undefined/vacíos", () => {
    const url = buildURL("/x", { a: "", b: undefined, c: 0, d: "ok" });
    expect(url).toBe("/x?c=0&d=ok");
  });
});
