// apps/web/vitest.setup.ts
import "@testing-library/jest-dom";
import { vi } from "vitest";

// TextEncoder/TextDecoder (por si faltan en el runtime del test)
import {
  TextDecoder as NodeTextDecoder,
  TextEncoder as NodeTextEncoder,
} from "node:util";
if (typeof globalThis.TextEncoder === "undefined") {
  (globalThis as any).TextEncoder = NodeTextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  (globalThis as any).TextDecoder =
    NodeTextDecoder as unknown as typeof globalThis.TextDecoder;
}

// ResizeObserver (Radix UI, etc.)
class TestResizeObserver implements ResizeObserver {
  private readonly cb: ResizeObserverCallback;
  private observing = false;

  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
  }
  observe(): void {
    // No-throw no-op para tests; mantenemos estado para evitar métodos vacíos
    this.observing = true;
  }
  unobserve(): void {
    this.observing = false;
  }
  disconnect(): void {
    this.observing = false;
  }
}
if (typeof globalThis.ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver =
    TestResizeObserver as unknown as typeof globalThis.ResizeObserver;
}

// matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // legacy
    removeListener: vi.fn(), // legacy
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// scrollIntoView (algunos componentes lo invocan)
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}

// IntersectionObserver (images/lazy)
class TestIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin = "";
  thresholds: ReadonlyArray<number> = [];
  private readonly cb: IntersectionObserverCallback;
  private observing = false;

  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
  }
  observe(): void {
    this.observing = true;
  }
  unobserve(): void {
    this.observing = false;
  }
  disconnect(): void {
    this.observing = false;
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
if (typeof globalThis.IntersectionObserver === "undefined") {
  (globalThis as any).IntersectionObserver =
    TestIntersectionObserver as unknown as typeof globalThis.IntersectionObserver;
}

/* =================================
   Mocks de Next.js para los tests UI
   ================================= */

class MockSearchParams {
  private readonly sp: URLSearchParams;
  constructor(init?: string) {
    this.sp = new URLSearchParams(init);
  }
  get(k: string) {
    return this.sp.get(k);
  }
  toString() {
    return this.sp.toString();
  }
}

vi.mock("next/navigation", () => {
  const replace = vi.fn();
  const push = vi.fn();
  const prefetch = vi.fn();
  const back = vi.fn();

  const useRouter = () => ({ replace, push, prefetch, back });
  const usePathname = () => "/properties";
  const useSearchParams = () => new MockSearchParams("");

  return { useRouter, usePathname, useSearchParams };
});
