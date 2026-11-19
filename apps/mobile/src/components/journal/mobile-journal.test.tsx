// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createI18nInstance, I18nProvider } from "@repo/locales";

const router = vi.hoisted(() => ({ push: vi.fn() }));
const auth = vi.hoisted(() => ({ userId: "me" as string | undefined }));
vi.mock("@repo/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@repo/ui")>()),
  useRouter: () => router,
  useUserId: () => auth.userId,
}));

import { MobileJournalOverviewEmpty } from "./MobileJournalOverviewEmpty";
import { MobileJournalMonthHeader } from "./MobileJournalHeaders";

afterEach(cleanup);

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

describe("MobileJournalOverviewEmpty", () => {
  it("sends the owner to the game search", () => {
    auth.userId = "me";
    render(
      <I18nProvider language="en">
        <MobileJournalOverviewEmpty userId="me" />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText("Add a game to your library"));
    expect(router.push).toHaveBeenCalledWith("/search");
  });

  it("offers no action on someone else's journal", () => {
    auth.userId = "me";
    render(
      <I18nProvider language="en">
        <MobileJournalOverviewEmpty userId="other" />
      </I18nProvider>,
    );
    expect(screen.queryByText("Add a game to your library")).toBeNull();
  });
});
