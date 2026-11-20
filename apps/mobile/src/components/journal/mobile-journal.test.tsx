// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createI18nInstance, I18nProvider } from "@repo/locales";

const openGameSearch = vi.hoisted(() => vi.fn());
const auth = vi.hoisted(() => ({ userId: "me" as string | undefined }));
vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => auth.userId }),
);

import { JournalMonthHeader, JournalOverviewEmpty, UIProvider } from "@repo/ui";
import { MantineProvider } from "@mantine/core";
import { MobileJournalMonthHeader } from "./MobileJournalHeaders";

afterEach(cleanup);
beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

describe("journal i18n", () => {
  it("formats month names in the active language", () => {
    render(
      <I18nProvider language="pt-BR">
        <MobileJournalMonthHeader year={2025} month={2} />
      </I18nProvider>,
    );
    expect(screen.getByRole("heading", { level: 3 }).textContent).toMatch(
      /março/i,
    );
  });

  it("formats month names in the shared default header too (web)", () => {
    render(
      <I18nProvider language="pt-BR">
        <MantineProvider>
          <JournalMonthHeader year={2025} month={2} />
        </MantineProvider>
      </I18nProvider>,
    );
    expect(screen.getByRole("heading").textContent).toMatch(/março/i);
  });

  it.each(["en", "pt-BR"] as const)(
    "pluralises achievement and game counts with plural keys in %s",
    (language) => {
      const { t } = createI18nInstance({ language });
      expect(t("journal.achievements.count", { count: 1 })).toMatch(/^1 /);
      expect(t("journal.achievements.count", { count: 1 })).not.toMatch(/s$/);
      expect(t("journal.achievements.count", { count: 3 })).toMatch(/s$/);
      expect(t("journal.overview.gamesCount", { count: 1 })).not.toMatch(/s$/);
      expect(t("journal.overview.gamesCount", { count: 2 })).toMatch(/s$/);
    },
  );
});

const renderEmpty = (userId: string, withSearch = true) =>
  render(
    <I18nProvider language="en">
      <MantineProvider>
        <UIProvider
          hooks={{
            useRouter: () => ({
              back: () => {},
              pathname: "",
              push: async () => {},
              query: new URLSearchParams(),
            }),
            useOpenGameSearch: withSearch ? () => openGameSearch : undefined,
          }}
        >
          <JournalOverviewEmpty userId={userId} />
        </UIProvider>
      </MantineProvider>
    </I18nProvider>,
  );

describe("JournalOverviewEmpty", () => {
  it("sends the owner to the game search", () => {
    auth.userId = "me";
    renderEmpty("me");
    fireEvent.click(screen.getByText("Add a game to your library"));
    expect(openGameSearch).toHaveBeenCalledTimes(1);
  });

  it("offers no action on someone else's journal", () => {
    auth.userId = "me";
    renderEmpty("other");
    expect(screen.queryByText("Add a game to your library")).toBeNull();
  });

  it("still explains the empty journal when the app has no search to open", () => {
    auth.userId = "me";
    renderEmpty("me", false);
    expect(screen.getByText("Your journal is empty")).toBeTruthy();
    expect(screen.queryByText("Add a game to your library")).toBeNull();
  });
});
