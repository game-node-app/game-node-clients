// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SimpleInfiniteLoader } from "../../../../../packages/ui/src/components/feed/SimpleInfiniteLoader";

const observer = vi.hoisted(() => ({
  entry: null as {
    isIntersecting: boolean;
    time: number;
    rootBounds: { top: number; bottom: number; left: number; right: number };
    target: {
      getBoundingClientRect: () => {
        top: number;
        bottom: number;
        left: number;
        right: number;
      };
    };
  } | null,
}));
vi.mock("@mantine/hooks", () => ({
  useIntersection: () => ({ ref: vi.fn(), entry: observer.entry }),
}));
vi.mock("#@/components", () => ({ CenteredLoading: () => null }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  observer.entry = null;
});

it("loads once per intersection, including when the callback changes during a fetch", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const fetchPage = vi.fn(async () => {});
  const props = (isFetching: boolean) => ({
    hasNextPage: true,
    isFetching,
    fetchNextPage: async () => fetchPage(),
  });
  const entry = (isIntersecting: boolean, time: number, top: number) => ({
    isIntersecting,
    time,
    rootBounds: { top: 0, bottom: 800, left: 0, right: 1000 },
    target: {
      getBoundingClientRect: () => ({ top, bottom: top, left: 0, right: 100 }),
    },
  });
  const view = render(<SimpleInfiniteLoader {...props(false)} />, {
    wrapper: MantineProvider,
  });

  observer.entry = entry(true, 600, 100);
  view.rerender(<SimpleInfiniteLoader {...props(true)} />);
  expect(fetchPage).not.toHaveBeenCalled();
  view.rerender(<SimpleInfiniteLoader {...props(false)} />);
  expect(fetchPage).toHaveBeenCalledTimes(1);

  view.rerender(<SimpleInfiniteLoader {...props(true)} />);
  view.rerender(<SimpleInfiniteLoader {...props(false)} />);
  expect(fetchPage).toHaveBeenCalledTimes(1);

  observer.entry = entry(false, 700, 1000);
  view.rerender(<SimpleInfiniteLoader {...props(false)} />);
  observer.entry = entry(true, 800, 1000);
  view.rerender(<SimpleInfiniteLoader {...props(false)} />);
  expect(fetchPage).toHaveBeenCalledTimes(1);
  observer.entry = entry(true, 900, 100);
  view.rerender(<SimpleInfiniteLoader {...props(false)} />);
  expect(fetchPage).toHaveBeenCalledTimes(2);
});
