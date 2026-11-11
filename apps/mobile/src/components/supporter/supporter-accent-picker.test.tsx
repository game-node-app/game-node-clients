// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SupporterAccentPicker } from "../../../../../packages/ui/src/components/supporter/perks/SupporterAccentPicker";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useI18nContext: () => ({ language: "en" }),
}));

function renderPicker(
  accentColor: string | null = null,
  onChange = vi.fn(),
  disabled = false,
) {
  const view = render(
    <MantineProvider>
      <SupporterAccentPicker
        accentColor={accentColor}
        onChange={onChange}
        disabled={disabled}
      />
    </MantineProvider>,
  );

  return { ...view, onChange };
}

function getColorInput() {
  return screen.getByRole("textbox", {
    name: "supporter.perks.accent.custom",
  });
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("SupporterAccentPicker", () => {
  it("sends the uppercase hex of a clicked preset", () => {
    const { onChange } = renderPicker(null);

    expect(screen.getAllByLabelText(/^#[0-9A-F]{6}$/)).toHaveLength(9);

    fireEvent.click(screen.getByLabelText("#F15025"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("#F15025");
  });

  it("marks the stored preset as selected, normalizing its case", () => {
    renderPicker("#ff8800");

    expect(
      screen.getByLabelText("#FF8800").getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen.getByLabelText("#9747FF").getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("commits a typed valid color in uppercase on blur", () => {
    const { onChange } = renderPicker(null);
    const input = getColorInput();

    fireEvent.change(input, { target: { value: "#ff8800" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith("#FF8800");
    expect(screen.queryByText("supporter.perks.accent.invalid")).toBeNull();
  });

  it("shows the invalid hint and sends nothing for a malformed color", () => {
    const { onChange } = renderPicker(null);
    const input = getColorInput();

    fireEvent.change(input, { target: { value: "#12" } });
    fireEvent.blur(input);

    expect(screen.getByText("supporter.perks.accent.invalid")).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("sends null on Reset and hides it when no custom color is stored", () => {
    const { onChange, rerender } = renderPicker("#9747FF");

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.perks.accent.reset" }),
    );

    expect(onChange).toHaveBeenCalledWith(null);

    rerender(
      <MantineProvider>
        <SupporterAccentPicker accentColor={null} onChange={onChange} />
      </MantineProvider>,
    );

    expect(
      screen.queryByRole("button", { name: "supporter.perks.accent.reset" }),
    ).toBeNull();
  });

  it("disables every control when requested", () => {
    renderPicker("#9747FF", vi.fn(), true);

    expect(getColorInput()).toHaveProperty("disabled", true);
    expect(
      (
        screen.getByRole("button", {
          name: "supporter.perks.accent.reset",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (screen.getByLabelText("#9747FF") as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
