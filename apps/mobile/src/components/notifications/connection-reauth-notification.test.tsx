// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import {
  NotificationConnectionTargetDto,
  NotificationImporterTargetDto,
  NotificationImportPreviewDto,
  NotificationInboxItemDto,
} from "@repo/wrapper/server";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import ptTranslations from "../../../../../packages/locales/src/translations/json/pt-BR.json";
import { AggregatedNotification } from "../../../../../packages/ui/src/components/notifications/AggregatedNotification";

const mockRouter = vi.hoisted(() => ({
  push: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../../packages/ui/src/util/link", () => ({
  useRouter: () => mockRouter,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({
    useUserId: () => "user-1",
  }),
);

let currentLang = "en";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const translations =
        currentLang === "pt-BR" ? ptTranslations : enTranslations;
      let val: unknown = translations;
      for (const p of key.split(".")) {
        val =
          typeof val === "object" && val !== null
            ? (val as Record<string, unknown>)[p]
            : undefined;
      }
      if (typeof val === "string") {
        return val.replace(/\{\{(\w+)\}\}/g, (_, k) =>
          String(options?.[k] ?? `{{${k}}}`),
        );
      }
      return key;
    },
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  currentLang = "en";
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
});

const renderItem = (item: NotificationInboxItemDto, onClick = vi.fn()) => {
  const view = render(
    <MantineProvider>
      <AggregatedNotification
        aggregatedNotification={item}
        backgroundColor="normal"
        onClick={onClick}
      />
    </MantineProvider>,
  );
  return { ...view, onClick };
};

const reauthItem = (
  provider: NotificationConnectionTargetDto.provider,
): NotificationInboxItemDto => ({
  id: 42,
  type: "connection.reauth-required",
  actors: [],
  actorCount: 0,
  eventCount: 1,
  preview: { text: "Your connection needs to be reconnected." },
  target: {
    type: NotificationConnectionTargetDto.type.CONNECTION,
    id: "7",
    provider,
  },
  lastEventAt: "2026-11-01T17:00:00.000Z",
  version: 1,
  readVersion: 0,
});

describe("connection.reauth-required notification", () => {
  it.each([
    [
      NotificationConnectionTargetDto.provider.EPICGAMES,
      "Your Epic Games connection needs to be reconnected.",
      "Sua conexão com Epic Games precisa ser reconectada.",
      "epicgames",
    ],
    [
      NotificationConnectionTargetDto.provider.XBOX,
      "Your Xbox Live connection needs to be reconnected.",
      "Sua conexão com Xbox Live precisa ser reconectada.",
      "xbox",
    ],
  ])(
    "renders %s text, icon and navigates in en and pt-BR",
    (provider, en, pt, icon) => {
      const { container, onClick } = renderItem(reauthItem(provider));

      expect(screen.getByText(en)).toBeTruthy();
      // Decorative: text already names the provider, and there is no actor avatar.
      const img = container.querySelector("img");
      expect(img?.getAttribute("src")).toContain(`/${icon}.png`);
      expect(img?.getAttribute("alt")).toBe("");

      fireEvent.click(screen.getByRole("alert"));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).toHaveBeenCalledWith("/preferences/connections");

      cleanup();
      currentLang = "pt-BR";
      renderItem(reauthItem(provider));
      expect(screen.getByText(pt)).toBeTruthy();
    },
  );

  it("does not crash without a target", () => {
    const { onClick } = renderItem({
      ...reauthItem("xbox" as never),
      target: null,
    });

    fireEvent.click(
      screen.getByText("Your connection needs to be reconnected."),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

describe("import.discovery-completed provider names", () => {
  const importItem = (provider: string): NotificationInboxItemDto => ({
    id: 11,
    type: "import.discovery-completed",
    actors: [],
    actorCount: 0,
    eventCount: 1,
    preview: {
      provider: provider as NotificationImportPreviewDto.provider,
      gameCount: 3,
      importedCount: 2,
      skippedCount: 0,
      failedCount: 0,
      gameSample: [],
    },
    target: {
      type: NotificationImporterTargetDto.type.IMPORTER,
      id: "imp",
      provider: provider as NotificationImporterTargetDto.provider,
    },
    lastEventAt: "2026-11-01T17:00:00.000Z",
    version: 1,
    readVersion: 1,
  });

  it("shows 'Epic Games' for Epic imports and navigates to the importer", () => {
    renderItem(importItem("epicgames"));

    expect(
      screen.getByText(
        /3 new games ready to be imported from your Epic Games connection/i,
      ),
    ).toBeTruthy();
    expect(screen.getByText(/2 automatically imported/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("alert"));
    expect(mockRouter.push).toHaveBeenCalledWith("/importer/epicgames");
  });

  it("does not crash when the import target is missing", () => {
    renderItem({ ...importItem("steam"), target: null });

    fireEvent.click(screen.getByRole("alert"));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
