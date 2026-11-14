// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDelayedLoadingIndicator } from "./useDelayedLoadingIndicator";

describe("useDelayedLoadingIndicator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderIndicator = (isLoading: boolean) =>
    renderHook(
      ({ loading }: { loading: boolean }) =>
        useDelayedLoadingIndicator(loading, {
          showDelayMs: 300,
          minVisibleMs: 500,
        }),
      { initialProps: { loading: isLoading } },
    );

  it("never shows when loading ends before the show delay", () => {
    const { result, rerender } = renderIndicator(false);

    rerender({ loading: true });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe(false);

    rerender({ loading: false });
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(false);
  });

  it("shows after the delay and respects the minimum visible time", () => {
    const { result, rerender } = renderIndicator(true);

    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe(false);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);

    rerender({ loading: false });
    act(() => vi.advanceTimersByTime(499));
    expect(result.current).toBe(true);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(false);
  });

  it("stays visible when loading starts again during the minimum visible time", () => {
    const { result, rerender } = renderIndicator(true);

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe(true);

    rerender({ loading: false });
    act(() => vi.advanceTimersByTime(200));
    rerender({ loading: true });
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(true);

    rerender({ loading: false });
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe(false);
  });
});
