// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  NotificationImporterTargetDto,
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

function renderItem(item: NotificationInboxItemDto) {
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
}

describe("import.discovery-completed notification localization", () => {
  const item: NotificationInboxItemDto = {
    id: 10,
    type: "import.discovery-completed",
    actors: [],
    actorCount: 0,
    eventCount: 1,
    preview: {
      provider:
        "steam" as unknown as import("@repo/wrapper/server").NotificationImportPreviewDto.provider,
      gameCount: 20,
      importedCount: 10,
      skippedCount: 5,
      failedCount: 1,
      gameSample: [
        { id: 1, title: "Hades" },
        { id: 2, title: "Celeste" },
      ],
    },
    target: {
      type: NotificationImporterTargetDto.type.IMPORTER,
      id: "imp-steam",
      provider: "steam" as unknown as NotificationImporterTargetDto.provider,
    },
    lastEventAt: "2026-10-25T12:00:00Z",
    version: 1,
    readVersion: 1,
  };

  it.each([
    ["steam", "Steam"],
    ["gog", "GOG"],
  ])(
    "renders %s with English translations, counts and target",
    async (provider, name) => {
      const providerItem = {
        ...item,
        target: { ...item.target, provider },
        preview: { ...item.preview, provider },
      } as NotificationInboxItemDto;
      currentLang = "en";

      const { container } = renderItem(providerItem);

      expect(
        screen.getByText(
          new RegExp(
            `We've found 20 new games ready to be imported from your ${name} connection`,
            "i",
          ),
        ),
      ).toBeTruthy();
      expect(screen.getByText(/10 automatically imported/i)).toBeTruthy();
      expect(screen.getByText(/5 already in your library/i)).toBeTruthy();
      expect(screen.getByText(/1 failed/i)).toBeTruthy();
      expect(screen.getByText(/Hades, Celeste/i)).toBeTruthy();

      // The name used to be the Notification aria-label; it is now a visible
      // row, with the shared discovery icon instead of the provider logo.
      expect(screen.getByText("Discovery completed")).toBeTruthy();
      expect(container.querySelector(".bg-nav-accent-subtle")).toBeTruthy();

      fireEvent.click(screen.getByText("Discovery completed"));
      expect(mockRouter.push).toHaveBeenCalledWith(`/importer/${provider}`);
    },
  );

  it.each([
    ["steam", "Steam"],
    ["gog", "GOG"],
  ])("renders %s with Portuguese translations", async (provider, name) => {
    const providerItem = {
      ...item,
      target: { ...item.target, provider },
      preview: { ...item.preview, provider },
    } as NotificationInboxItemDto;
    currentLang = "pt-BR";

    renderItem(providerItem);

    expect(
      screen.getByText(
        new RegExp(
          `Encontramos 20 novos jogos prontos para serem importados da sua conexão com ${name}`,
          "i",
        ),
      ),
    ).toBeTruthy();
    expect(screen.getByText(/10 importados automaticamente/i)).toBeTruthy();
    expect(screen.getByText(/5 já na sua biblioteca/i)).toBeTruthy();
    expect(screen.getByText(/1 com falha/i)).toBeTruthy();
    expect(screen.getByText(/Hades, Celeste/i)).toBeTruthy();
    expect(screen.getByText("Descoberta concluída")).toBeTruthy();
  });
});
