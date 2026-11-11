// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen } from "@testing-library/react";
import { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import frameClasses from "../../../../../packages/ui/src/components/supporter/perks/SupporterAvatarFrame.module.css";
import { SupporterAvatarFrame } from "../../../../../packages/ui/src/components/supporter/perks/SupporterAvatarFrame";
import { SupporterBadge } from "../../../../../packages/ui/src/components/supporter/perks/SupporterBadge";
import { SupporterTitle } from "../../../../../packages/ui/src/components/supporter/perks/SupporterTitle";
import {
  DEFAULT_SUPPORTER_PREFERENCES,
  getActiveSupporterPerks,
} from "../../../../../packages/ui/src/components/supporter/perks/supporterPerks";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";

const mantineHooks = vi.hoisted(() => ({ reducedMotion: false }));

vi.mock("@mantine/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mantine/hooks")>();

  return {
    ...actual,
    useReducedMotion: () => mantineHooks.reducedMotion,
  };
});

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (
        ({
          "supporter.badge.label": "Supporter",
          "supporter.titles.patron": "Patron",
        }) as Record<string, string>
      )[key] ?? key,
  }),
  useI18nContext: () => ({ language: "en" }),
}));

const perks = getActiveSupporterPerks({
  isSupporter: true,
  supporterPreferences: DEFAULT_SUPPORTER_PREFERENCES,
});

function renderWithProvider(ui: ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

/** jsdom normalizes inline hex colors to `rgb(r, g, b)`. */
function rgb(hex: string) {
  const value = hex.replace("#", "");

  return `rgb(${parseInt(value.slice(0, 2), 16)}, ${parseInt(
    value.slice(2, 4),
    16,
  )}, ${parseInt(value.slice(4, 6), 16)})`;
}

beforeEach(() => {
  mantineHooks.reducedMotion = false;
  setProjectContext({
    client: "web",
    s3BucketUrl: "",
    serverUrl: "",
    searchUrl: "",
  });
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
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("SupporterBadge", () => {
  it("renders the compact badge with an accessible label and no text", () => {
    renderWithProvider(<SupporterBadge variant={"compact"} perks={perks} />);

    const badge = screen.getByLabelText("Supporter");

    expect(badge).toBeTruthy();
    expect(badge.textContent).toBe("");
    expect(screen.queryByText("Supporter")).toBeNull();
  });

  it("renders the compact badge with the theme accent color", () => {
    renderWithProvider(<SupporterBadge variant={"compact"} perks={perks} />);

    expect(screen.getByLabelText("Supporter").style.color).toBe(rgb("#A159FF"));
  });

  it("renders the full badge with the translated label", () => {
    renderWithProvider(<SupporterBadge variant={"full"} perks={perks} />);

    expect(screen.getByText("Supporter")).toBeTruthy();
    expect(screen.queryByLabelText("Supporter")).toBeNull();
  });

  it("renders nothing without active perks", () => {
    const { container } = renderWithProvider(
      <SupporterBadge variant={"full"} perks={null} />,
    );

    expect(
      container.querySelector("[data-testid='supporter-badge']"),
    ).toBeNull();
    expect(screen.queryByLabelText("Supporter")).toBeNull();
  });
});

describe("SupporterTitle", () => {
  it("renders the translated title", () => {
    renderWithProvider(<SupporterTitle titleKey={"patron"} perks={perks} />);

    const title = screen.getByText("Patron");

    expect(title).toBeTruthy();
    expect(title.style.color).toBe(rgb(perks!.accentText));
  });

  it("renders nothing for a null title", () => {
    const { container } = renderWithProvider(
      <SupporterTitle titleKey={null} perks={perks} />,
    );

    expect(container.querySelector("p")).toBeNull();
  });

  it("uses the neutral color when the theme is off", () => {
    const themeOffPerks = getActiveSupporterPerks({
      isSupporter: true,
      supporterPreferences: {
        ...DEFAULT_SUPPORTER_PREFERENCES,
        showSupporterTheme: false,
      },
    });

    renderWithProvider(
      <SupporterTitle titleKey={"patron"} perks={themeOffPerks} />,
    );

    expect(screen.getByText("Patron").style.color).toBe(rgb("#adadad"));
  });
});

describe("SupporterAvatarFrame", () => {
  it("animates the ring by default", () => {
    renderWithProvider(
      <SupporterAvatarFrame accent={"#9747FF"}>
        <span>avatar</span>
      </SupporterAvatarFrame>,
    );

    const frame = screen.getByTestId("supporter-avatar-frame");

    expect(frame.className).toContain(frameClasses.frame);
    expect(frame.className).not.toContain(frameClasses.static);
    expect(frame.style.getPropertyValue("--ring")).not.toBe("");
  });

  it("adds the static class when the viewer prefers reduced motion", () => {
    mantineHooks.reducedMotion = true;

    renderWithProvider(
      <SupporterAvatarFrame accent={"#9747FF"}>
        <span>avatar</span>
      </SupporterAvatarFrame>,
    );

    expect(screen.getByTestId("supporter-avatar-frame").className).toContain(
      frameClasses.static,
    );
  });

  it("adds the static class when animated is false", () => {
    renderWithProvider(
      <SupporterAvatarFrame accent={"#9747FF"} animated={false}>
        <span>avatar</span>
      </SupporterAvatarFrame>,
    );

    expect(screen.getByTestId("supporter-avatar-frame").className).toContain(
      frameClasses.static,
    );
  });
});
