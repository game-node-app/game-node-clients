// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { MantineProvider, SegmentedControl } from "@mantine/core";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { DEFAULT_MANTINE_THEME } from "../../../../packages/ui/src/util/theme";

const resolve = (color: string) =>
  DEFAULT_MANTINE_THEME.variantColorResolver({
    color,
    variant: "light",
    theme: DEFAULT_MANTINE_THEME,
  });

describe("light variant colors", () => {
  it("tints flat brand palette instead of orange-on-brown", () => {
    expect(resolve("brand")).toMatchObject({
      background: "rgba(241, 80, 37, 0.15)",
      // brand lightened just enough to reach 4.5:1 on its own tint
      color: "#f25e36",
    });
  });

  it("leaves real palettes on Mantine defaults", () => {
    expect(resolve("teal").color).toBe("var(--mantine-color-teal-light-color)");
  });
});

describe("ThemeIcon default color", () => {
  it("is explicit so ThemeIcon goes through variantColorResolver", () => {
    expect(
      DEFAULT_MANTINE_THEME.components.ThemeIcon?.defaultProps?.color,
    ).toBe("brand");
  });
});

describe("Chip default color", () => {
  it("is explicit so an unstyled Chip goes through variantColorResolver", () => {
    expect(DEFAULT_MANTINE_THEME.components.Chip?.defaultProps?.color).toBe(
      "brand",
    );
  });
});

describe("SegmentedControl on a flat brand palette", () => {
  const label = (color?: string) => {
    // jsdom lacks both; Mantine's provider and SegmentedControl need them.
    window.matchMedia ??= (() => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as never;
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as never;
    const { container } = render(
      createElement(
        MantineProvider,
        { theme: DEFAULT_MANTINE_THEME },
        createElement(SegmentedControl, { data: ["a", "b"], color }),
      ),
    );
    return container.querySelector("label") as HTMLElement;
  };

  it("uses dark text on the orange indicator instead of white", () => {
    expect(label("brand").style.getPropertyValue("--sc-label-color")).toBe(
      "var(--mantine-color-black)",
    );
  });

  it("leaves an uncoloured control on Mantine's own label colour", () => {
    expect(label().style.getPropertyValue("--sc-label-color")).toBe("");
  });
});
