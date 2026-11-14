// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  NotificationConnectionTargetDto,
  NotificationImporterTargetDto,
  NotificationImportPreviewDto,
  NotificationInboxItemDto,
  NotificationsService,
} from "@repo/wrapper/server";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import ptTranslations from "../../../../../packages/locales/src/translations/json/pt-BR.json";
import { InboxNotificationItem } from "../../../../../packages/ui/src/components/notifications/view/InboxNotificationItem";

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
    i18n: { language: currentLang },
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
      if (typeof val !== "string") {
        const count = Number(options?.count ?? 0);
        let plural: unknown = translations;
        for (const p of `${key}_${count === 1 ? "one" : "other"}`.split(".")) {
          plural =
            typeof plural === "object" && plural !== null
              ? (plural as Record<string, unknown>)[p]
              : undefined;
        }
        val = plural;
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
  vi.spyOn(
    NotificationsService,
    "notificationsControllerFindAllV1",
  ).mockResolvedValue({
    data: [],
    pagination: { nextCursor: null, hasMore: false },
    unreadCount: 0,
  });
  vi.spyOn(
    NotificationsService,
    "notificationsControllerAcknowledgeReadV1",
  ).mockResolvedValue(undefined);
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
  vi.restoreAllMocks();
});

const renderItem = (item: NotificationInboxItemDto) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchInterval: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <InboxNotificationItem item={item} />
      </MantineProvider>
    </QueryClientProvider>,
  );
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
      NotificationConnectionTargetDto.provider.GOG,
      "Your GOG connection needs to be reconnected.",
      "Sua conexão com GOG precisa ser reconectada.",
    ],
    [
      NotificationConnectionTargetDto.provider.EPICGAMES,
      "Your Epic Games connection needs to be reconnected.",
      "Sua conexão com Epic Games precisa ser reconectada.",
    ],
    [
      NotificationConnectionTargetDto.provider.NINTENDO,
      "Your Nintendo connection needs to be reconnected.",
      "Sua conexão com Nintendo precisa ser reconectada.",
    ],
    [
      NotificationConnectionTargetDto.provider.XBOX,
      "Your Xbox Live connection needs to be reconnected.",
      "Sua conexão com Xbox Live precisa ser reconectada.",
    ],
  ])("renders %s text and navigates in en and pt-BR", (provider, en, pt) => {
    const { container } = renderItem(reauthItem(provider));

    expect(screen.getByText(en)).toBeTruthy();
    // The provider logo was replaced by the shared connection icon (design §5):
    // an icon over the subtle accent background, never an actor avatar.
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".bg-nav-accent-subtle")).toBeTruthy();

    fireEvent.click(screen.getByText(en));
    expect(mockRouter.push).toHaveBeenCalledWith("/preferences/connections");

    cleanup();
    currentLang = "pt-BR";
    renderItem(reauthItem(provider));
    expect(screen.getByText(pt)).toBeTruthy();
  });

  it("does not crash without a target", () => {
    renderItem({
      ...reauthItem("xbox" as never),
      target: null,
    });

    fireEvent.click(
      screen.getByText("Your connection needs to be reconnected."),
    );
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

    fireEvent.click(screen.getByText("Discovery completed"));
    expect(mockRouter.push).toHaveBeenCalledWith("/importer/epicgames");
  });

  it("shows 'Nintendo' for Nintendo imports and navigates to the importer", () => {
    renderItem(importItem("nintendo"));

    expect(
      screen.getByText(
        /3 new games ready to be imported from your Nintendo connection/i,
      ),
    ).toBeTruthy();

    fireEvent.click(screen.getByText("Discovery completed"));
    expect(mockRouter.push).toHaveBeenCalledWith("/importer/nintendo");
  });

  it("shows GOG counts, the discovery icon and importer destination", () => {
    const { container } = renderItem(importItem("gog"));
    expect(
      screen.getByText(
        /3 new games ready to be imported from your GOG connection/i,
      ),
    ).toBeTruthy();
    expect(screen.getByText(/2 automatically imported/i)).toBeTruthy();
    expect(container.querySelector(".bg-nav-accent-subtle")).toBeTruthy();
    fireEvent.click(screen.getByText("Discovery completed"));
    expect(mockRouter.push).toHaveBeenCalledWith("/importer/gog");
  });

  it("does not crash when the import target is missing", () => {
    renderItem({ ...importItem("steam"), target: null });

    fireEvent.click(screen.getByText("Discovery completed"));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
