// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FloatingLabelInput } from "../../../../../packages/ui/src/components/general/input/FloatingLabelInput/FloatingLabelInput";

afterEach(cleanup);

it("preserves input class overrides supplied as an object or a callback", () => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  const props = { label: "Search", value: "query", onChange: vi.fn() };
  const { rerender } = render(
    <MantineProvider forceColorScheme="light">
      <FloatingLabelInput {...props} classNames={{ input: "object-input" }} />
    </MantineProvider>,
  );
  expect(
    screen.getByLabelText("Search").classList.contains("object-input"),
  ).toBe(true);
  rerender(
    <MantineProvider forceColorScheme="light">
      <FloatingLabelInput
        {...props}
        classNames={() => ({ input: "callback-input" })}
      />
    </MantineProvider>,
  );
  expect(
    screen.getByLabelText("Search").classList.contains("callback-input"),
  ).toBe(true);
});
