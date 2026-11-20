// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { DEFAULT_MANTINE_THEME, LibrarySearchInput } from "@repo/ui";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const Providers = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider theme={DEFAULT_MANTINE_THEME} forceColorScheme="dark">
    {children}
  </MantineProvider>
);

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const renderInput = (value = "") => {
  const onSearchChange = vi.fn();
  render(
    <LibrarySearchInput
      value={value}
      onSearchChange={onSearchChange}
      placeholder="Search this library"
    />,
    { wrapper: Providers },
  );
  return {
    onSearchChange,
    input: screen.getByRole("searchbox", { name: "library.search.label" }),
  };
};

it("commits typed text only after the debounce", () => {
  const { input, onSearchChange } = renderInput();

  fireEvent.change(input, { target: { value: "zel" } });
  act(() => void vi.advanceTimersByTime(200));
  expect(onSearchChange).not.toHaveBeenCalled();

  act(() => void vi.advanceTimersByTime(150));
  expect(onSearchChange).toHaveBeenCalledTimes(1);
  expect(onSearchChange).toHaveBeenCalledWith("zel");
});

it("commits an empty search immediately on Escape and on the clear button", () => {
  const { input, onSearchChange } = renderInput("zelda");

  fireEvent.keyDown(input, { key: "Escape" });
  expect(onSearchChange).toHaveBeenLastCalledWith("");
  expect((input as HTMLInputElement).value).toBe("");

  onSearchChange.mockClear();
  fireEvent.change(input, { target: { value: "mario" } });
  fireEvent.click(screen.getByRole("button", { name: "library.search.clear" }));
  expect(onSearchChange).toHaveBeenCalledWith("");

  // The stale debounced "mario" must not be committed afterwards.
  act(() => void vi.advanceTimersByTime(500));
  expect(onSearchChange).toHaveBeenCalledTimes(1);
});
