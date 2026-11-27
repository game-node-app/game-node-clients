// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useOnMobile } from "../../../../../packages/ui/src/components/general/hooks/useOnMobile";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Consumer() {
  return <span>{useOnMobile() ? "mobile" : "desktop"}</span>;
}

it("updates a whole grid through one shared media listener", () => {
  let matches = false;
  const listeners = new Set<() => void>();
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    get matches() {
      return matches;
    },
    addEventListener: (_type: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.delete(listener);
    },
    addListener: () => {},
    removeListener: () => {},
  }));

  const { unmount } = render(
    <MantineProvider>
      {Array.from({ length: 120 }, (_, index) => (
        <Consumer key={index} />
      ))}
    </MantineProvider>,
  );

  expect(screen.getAllByText("desktop")).toHaveLength(120);
  // Mantine itself may listen to other queries; ours is registered once.
  const registered = listeners.size;
  expect(registered).toBeLessThan(5);

  act(() => {
    matches = true;
    listeners.forEach((listener) => listener());
  });
  expect(screen.getAllByText("mobile")).toHaveLength(120);

  unmount();
  expect(listeners.size).toBe(0);
});
