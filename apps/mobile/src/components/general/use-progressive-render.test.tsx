// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useProgressiveRender } from "../../../../../packages/ui/src/components/general/hooks/useProgressiveRender";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let callbacks: Callback[] = [];

class MockIntersectionObserver {
  constructor(callback: Callback) {
    callbacks.push(callback);
  }
  observe() {}
  disconnect() {}
}

afterEach(() => {
  callbacks = [];
  vi.unstubAllGlobals();
});

describe("useProgressiveRender", () => {
  it("reveals one batch each time the sentinel intersects", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const { result } = renderHook(() =>
      useProgressiveRender(25, { initialCount: 10, step: 10 }),
    );
    expect(result.current.visibleCount).toBe(10);
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.sentinelRef(document.createElement("div")));
    act(() => callbacks.at(-1)!([{ isIntersecting: true }]));
    expect(result.current.visibleCount).toBe(20);

    act(() => callbacks.at(-1)!([{ isIntersecting: false }]));
    expect(result.current.visibleCount).toBe(20);

    act(() => callbacks.at(-1)!([{ isIntersecting: true }]));
    expect(result.current.hasMore).toBe(false);
  });

  it("renders everything without IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { result } = renderHook(() =>
      useProgressiveRender(40, { initialCount: 10 }),
    );
    act(() => result.current.sentinelRef(document.createElement("div")));
    expect(result.current.visibleCount).toBe(40);
  });
});
