// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  FollowService,
  NotificationInboxItemDto,
  NotificationProfileTargetDto,
  NotificationsResponseDto,
  NotificationsService,
  ProfileService,
} from "@repo/wrapper/server";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import { NotificationsPanel } from "../../../../../packages/ui/src/components/notifications/view/NotificationsPanel";

const mockRouter = vi.hoisted(() => ({
  push: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../../packages/ui/src/util/link", () => ({
  useRouter: () => mockRouter,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "own-user-id" }),
);

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    i18n: { language: "en" },
    t: (key: string, options?: Record<string, unknown>) => {
      const lookup = (dictionary: unknown, path: string): unknown => {
        let value: unknown = dictionary;
        for (const part of path.split(".")) {
          value =
            typeof value === "object" && value !== null
              ? (value as Record<string, unknown>)[part]
              : undefined;
        }
        return value;
      };

      let value = lookup(enTranslations, key);
      if (typeof value !== "string") {
        const count = Number(options?.count ?? 0);
        value = lookup(
          enTranslations,
          `${key}_${count === 1 ? "one" : "other"}`,
        );
      }
      if (typeof value !== "string") return key;

      return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
        String(options?.[name] ?? ""),
      );
    },
  }),
}));

const LAST_EVENT_AT = new Date().toISOString();

function createItem(
  overrides: Partial<NotificationInboxItemDto> & { id: number },
): NotificationInboxItemDto {
  return {
    type: "profile.followed",
    actors: [{ userId: "actor-1", username: "alice" }],
    actorCount: 1,
    eventCount: 1,
    preview: null,
    target: { type: NotificationProfileTargetDto.type.PROFILE, id: "actor-1" },
    lastEventAt: LAST_EVENT_AT,
    version: 1,
    readVersion: 0,
    ...overrides,
  };
}

const followedItem = createItem({
  id: 1,
  actors: [
    { userId: "actor-1", username: "alice", isFollowedByRecipient: false },
  ],
});

function createPage(
  data: NotificationInboxItemDto[],
): NotificationsResponseDto {
  return {
    data,
    pagination: { nextCursor: null, hasMore: false },
    unreadCount: data.filter((item) => item.readVersion < item.version).length,
  };
}

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchInterval: false },
      mutations: { retry: false },
    },
  });
}

function renderPanel(ui: ReactElement, client = createClient()) {
  return render(
    <QueryClientProvider client={client}>
      <MantineProvider>{ui}</MantineProvider>
    </QueryClientProvider>,
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function mockInbox(
  allPage: NotificationsResponseDto,
  unreadPage: NotificationsResponseDto,
) {
  return vi
    .spyOn(NotificationsService, "notificationsControllerFindAllV1")
    .mockImplementation(((cursor?: string, limit?: number, filter?: string) =>
      Promise.resolve(
        filter === "unread" ? unreadPage : allPage,
      )) as unknown as typeof NotificationsService.notificationsControllerFindAllV1);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(ProfileService, "profileControllerFindOneByIdV1").mockResolvedValue(
    {} as never,
  );
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("NotificationsPanel", () => {
  it("renders the header, tabs and items and offers the see-all and settings actions", async () => {
    mockInbox(createPage([followedItem]), createPage([followedItem]));
    const onSeeAll = vi.fn();
    const onOpenSettings = vi.fn();

    renderPanel(
      <NotificationsPanel
        variant="popover"
        onSeeAll={onSeeAll}
        onOpenSettings={onOpenSettings}
      />,
    );

    expect(screen.getByText("Notifications")).toBeTruthy();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(await screen.findByText("alice")).toBeTruthy();
    expect(screen.getByText("started following you.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "See all" }));
    expect(onSeeAll).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Notification settings" }),
    );
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it("follows back from the item without navigating nor acknowledging it as read, and hides the action", async () => {
    mockInbox(createPage([followedItem]), createPage([followedItem]));
    const followSpy = vi
      .spyOn(FollowService, "followControllerRegisterFollowV1")
      .mockResolvedValue({} as never);
    const acknowledgeSpy = vi.spyOn(
      NotificationsService,
      "notificationsControllerAcknowledgeReadV1",
    );
    const readAllSpy = vi.spyOn(
      NotificationsService,
      "notificationsControllerAcknowledgeReadAllV1",
    );

    renderPanel(
      <NotificationsPanel variant="popover" onOpenSettings={vi.fn()} />,
    );

    const followButton = await screen.findByRole("button", {
      name: "Follow back",
    });
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(followSpy).toHaveBeenCalledWith({ followedUserId: "actor-1" });
    });

    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(acknowledgeSpy).not.toHaveBeenCalled();
    expect(readAllSpy).not.toHaveBeenCalled();
    expect(
      ProfileService.profileControllerFindOneByIdV1,
    ).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Follow back" })).toBeNull();
    });
  });

  it("marks the whole inbox as read with a single read-all call and disables the action meanwhile", async () => {
    mockInbox(createPage([followedItem]), createPage([followedItem]));
    const pending = deferred<{ success: boolean; unreadCount: number }>();
    const readAllSpy = vi
      .spyOn(
        NotificationsService,
        "notificationsControllerAcknowledgeReadAllV1",
      )
      .mockReturnValue(pending.promise as never);

    renderPanel(<NotificationsPanel variant="page" onOpenSettings={vi.fn()} />);

    const markAll = await screen.findByRole("button", {
      name: "Mark all as read",
    });
    await waitFor(() => {
      expect(markAll.hasAttribute("disabled")).toBe(false);
    });

    fireEvent.click(markAll);

    await waitFor(() => {
      expect(readAllSpy).toHaveBeenCalledTimes(1);
    });
    expect(readAllSpy).toHaveBeenCalledWith({ before: LAST_EVENT_AT });
    expect(markAll.hasAttribute("disabled")).toBe(true);

    pending.resolve({ success: true, unreadCount: 0 });
  });

  it("queries each tab with its own filter and shows the empty state of the selected tab", async () => {
    vi.spyOn(
      NotificationsService,
      "notificationsControllerFindAllV1",
    ).mockResolvedValue({
      data: [],
      pagination: { nextCursor: null, hasMore: false },
      unreadCount: 0,
    });

    renderPanel(<NotificationsPanel variant="page" onOpenSettings={vi.fn()} />);

    expect(await screen.findByText("No notifications.")).toBeTruthy();
    // Nothing unread: mark-all starts disabled, and the page has no footer.
    expect(
      screen
        .getByRole("button", { name: "Mark all as read" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(screen.queryByRole("button", { name: "See all" })).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: /unread/i }));

    expect(await screen.findByText("You're all caught up.")).toBeTruthy();

    await waitFor(() => {
      expect(
        NotificationsService.notificationsControllerFindAllV1,
      ).toHaveBeenCalledWith(undefined, 10, "unread");
    });
  });
});
