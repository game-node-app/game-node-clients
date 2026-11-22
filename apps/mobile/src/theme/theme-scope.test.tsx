// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it } from "vitest";
import { ThemeScope } from "../../../../packages/ui/src/theme/ThemeScope";

afterEach(cleanup);

it("scopes a subtree to the default dark theme", () => {
  render(<ThemeScope data-testid="scope">content</ThemeScope>);
  const scope = screen.getByTestId("scope");
  expect(scope.getAttribute("data-gn-scope")).toBe("dark");
  expect(scope.getAttribute("data-mantine-color-scheme")).toBe("dark");
});

it("resolves the Mantine color scheme of a named theme", () => {
  render(
    <>
      <ThemeScope data-testid="ruins" theme="ruins" />
      <ThemeScope data-testid="xbox" theme="xbox" className="page" />
    </>,
  );
  expect(screen.getByTestId("ruins").getAttribute("data-gn-scope")).toBe(
    "ruins",
  );
  expect(
    screen.getByTestId("ruins").getAttribute("data-mantine-color-scheme"),
  ).toBe("light");
  expect(screen.getByTestId("xbox").className).toBe("page");
  expect(
    screen.getByTestId("xbox").getAttribute("data-mantine-color-scheme"),
  ).toBe("dark");
});

it("paints the scope background only on request", () => {
  // jsdom drops `var()` declarations, so inspect the serialized markup.
  expect(renderToStaticMarkup(<ThemeScope />)).not.toContain("style=");
  expect(renderToStaticMarkup(<ThemeScope surface />)).toContain(
    "background-color:var(--mantine-color-body)",
  );
});
