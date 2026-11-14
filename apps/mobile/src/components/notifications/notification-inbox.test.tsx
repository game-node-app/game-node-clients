// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  NotificationActivityTargetDto,
  NotificationContentTargetDto,
  NotificationImporterTargetDto,
  NotificationInboxItemDto,
  NotificationProfileTargetDto,
  NotificationsService,
  ProfileService,
  ReviewsService,
} from "@repo/wrapper/server";
import {
  acknowledgeNotificationsRead,
  useInfiniteAggregatedNotifications,
} from "../../../../../packages/ui/src/components/notifications";
import { InboxNotificationItem } from "../../../../../packages/ui/src/components/notifications/view/InboxNotificationItem";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import NotificationsIcon from "./NotificationsIcon";

const mockRouter = vi.hoisted(() => ({
  push: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../../packages/ui/src/util/link", () => ({
  useRouter: () => mockRouter,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "test-user-id" }),
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

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderUI(ui: React.ReactElement, client = createTestQueryClient()) {
  return render(
    <QueryClientProvider client={client}>
      <MantineProvider>{ui}</MantineProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRouter.push.mockResolvedValue(undefined);
  vi.spyOn(ProfileService, "profileControllerFindOneByIdV1").mockResolvedValue({
    userId: "u1",
    username: "alice",
    bio: "",
    avatar: {
      id: 10,
      filename: "alice_avatar",
      extension: "png",
      mimetype: "image/png",
      encoding: "7bit",
      size: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      deletedAt: null,
    },
    banner: null,
    avatarVideo: null,
    bannerVideo: null,
    usernameLastUpdatedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  } as unknown as import("@repo/wrapper/server").ProfileResponseDto);
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

describe("Notification Inbox - Zero-hydration item rendering", () => {
  it("renders content.liked with lead actor avatar, names, remaining count, and preview without entity queries", () => {
    const item: NotificationInboxItemDto = {
      id: 1,
      type: "content.liked",
      actors: [
        {
          userId: "u1",
          username: "alice",
          avatar: { id: 10, filename: "alice_avatar", extension: "png" },
        },
        { userId: "u2", username: "bob" },
      ],
      actorCount: 4,
      eventCount: 4,
      preview: { text: "Liked your post" },
      target: { type: NotificationContentTargetDto.type.POST, id: "post-100" },
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 2,
      readVersion: 1,
    };

    renderUI(<InboxNotificationItem item={item} />);

    // Lead actor name plus the remaining count (4 - 1 = 3)
    expect(screen.getByText("alice and 3 more")).toBeTruthy();
    // Message comes from the translated key for the target type
    expect(screen.getByText("liked your post.")).toBeTruthy();
  });

  it("renders the lead actor avatar from the notification DTO without resolving the profile", () => {
    const item: NotificationInboxItemDto = {
      id: 12,
      type: "content.liked",
      actors: [
        {
          userId: "u1",
          username: "alice",
          avatar: { id: 10, filename: "alice_avatar", extension: "png" },
        },
      ],
      actorCount: 1,
      eventCount: 1,
      preview: { text: "Liked your post" },
      target: { type: NotificationContentTargetDto.type.POST, id: "post-200" },
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 1,
      readVersion: 1,
    };

    const { container } = renderUI(<InboxNotificationItem item={item} />);

    // The avatar is built from `actors[0].avatar` (filename + extension) and
    // never resolves the actor profile, so the inbox issues no request per row.
    expect(container.querySelector('img[src="alice_avatar.png"]')).toBeTruthy();
    expect(
      ProfileService.profileControllerFindOneByIdV1,
    ).not.toHaveBeenCalled();
  });

  it("renders content.liked with activity target and game context without entity queries", () => {
    const item: NotificationInboxItemDto = {
      id: 2,
      type: "content.liked",
      actors: [{ userId: "u1", username: "alice" }],
      actorCount: 1,
      eventCount: 1,
      preview: { text: "Liked your activity" },
      target: {
        type: NotificationActivityTargetDto.type.ACTIVITY,
        id: "act-1",
        activityType: "play",
        game: {
          id: 99,
          name: "Chrono Trigger",
          slug: "chrono-trigger",
          coverUrl: null,
        },
      },
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 1,
      readVersion: 1,
    };

    renderUI(<InboxNotificationItem item={item} />);

    expect(screen.getByText(/alice/i)).toBeTruthy();
    expect(
      screen.getByText("liked your activity of Chrono Trigger."),
    ).toBeTruthy();
  });

  it("renders comment.created directly from materialized preview and target", () => {
    const item: NotificationInboxItemDto = {
      id: 3,
      type: "comment.created",
      actors: [{ userId: "u1", username: "alice" }],
      actorCount: 1,
      eventCount: 1,
      preview: { text: "Great review!" },
      target: { type: NotificationContentTargetDto.type.REVIEW, id: "rev-1" },
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 1,
      readVersion: 0,
    };

    renderUI(<InboxNotificationItem item={item} />);

    expect(screen.getByText(/alice/i)).toBeTruthy();
    expect(
      screen.getByText(/commented on your review: "Great review!"/i),
    ).toBeTruthy();
  });

  it("renders comment.replied directly from materialized preview", () => {
    const item: NotificationInboxItemDto = {
      id: 4,
      type: "comment.replied",
      actors: [{ userId: "u2", username: "bob" }],
      actorCount: 1,
      eventCount: 1,
      preview: { text: "I agree with this" },
      target: { type: NotificationContentTargetDto.type.POST, id: "post-1" },
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 1,
      readVersion: 0,
    };

    renderUI(<InboxNotificationItem item={item} />);

    expect(screen.getByText(/bob/i)).toBeTruthy();
    expect(
      screen.getByText(/replied to your comment: "I agree with this"/i),
    ).toBeTruthy();
  });

  it("renders profile.followed directly from materialized actors", () => {
    const item: NotificationInboxItemDto = {
      id: 5,
      type: "profile.followed",
      actors: [{ userId: "u3", username: "charlie" }],
      actorCount: 1,
      eventCount: 1,
      preview: null,
      target: { type: NotificationProfileTargetDto.type.PROFILE, id: "u3" },
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 1,
      readVersion: 0,
    };

    renderUI(<InboxNotificationItem item={item} />);

    expect(screen.getByText(/charlie/i)).toBeTruthy();
    expect(screen.getByText(/started following you\./i)).toBeTruthy();
  });

  it("renders import.discovery-completed with the discovery icon, counts and sampled titles without entity queries", () => {
    const item: NotificationInboxItemDto = {
      id: 6,
      type: "import.discovery-completed",
      actors: [],
      actorCount: 0,
      eventCount: 1,
      preview: {
        provider:
          "steam" as unknown as import("@repo/wrapper/server").NotificationImportPreviewDto.provider,
        gameCount: 15,
        importedCount: 5,
        skippedCount: 8,
        failedCount: 2,
        gameSample: [
          { id: 1, title: "Hades" },
          { id: 2, title: "Celeste" },
        ],
      },
      target: {
        type: NotificationImporterTargetDto.type.IMPORTER,
        id: "imp-1",
        provider: "steam" as unknown as NotificationImporterTargetDto.provider,
      },
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 1,
      readVersion: 1,
    };

    renderUI(<InboxNotificationItem item={item} />);

    expect(screen.getByText("Discovery completed")).toBeTruthy();
    expect(
      screen.getByText(
        /15 new games ready to be imported from your Steam connection/i,
      ),
    ).toBeTruthy();
    expect(screen.getByText(/5 automatically imported/i)).toBeTruthy();
    expect(screen.getByText(/8 already in your library/i)).toBeTruthy();
    expect(screen.getByText(/2 failed/i)).toBeTruthy();
    expect(screen.getByText(/Hades, Celeste/i)).toBeTruthy();
  });

  it("renders moderation.applied with localized notice, reason, and appeal text without report queries", () => {
    const item: NotificationInboxItemDto = {
      id: 7,
      type: "moderation.applied",
      actors: [],
      actorCount: 0,
      eventCount: 1,
      preview: {
        text: "",
        action: "suspension" as unknown as
          | import("@repo/wrapper/server").NotificationTextPreviewDto.action
          | undefined,
        reason: "Inappropriate review text",
      },
      target: null,
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 1,
      readVersion: 1,
    };

    renderUI(<InboxNotificationItem item={item} />);

    expect(screen.getByText("Suspension")).toBeTruthy();
    const message = screen.getByText(/Inappropriate review text/i);
    expect(message.textContent).toContain(
      "The reported content may have been deleted.",
    );
    expect(message.textContent).toContain(
      "If you think this is a mistake. Please reach out to us through our Discord.",
    );
  });

  it("renders ten distinct actors without issuing a single profile request", () => {
    const items: NotificationInboxItemDto[] = Array.from(
      { length: 10 },
      (_, index) => ({
        id: 100 + index,
        type: "profile.followed",
        actors: [
          {
            userId: `actor-${index}`,
            username: `user_${index}`,
            avatar: {
              id: index + 1,
              filename: `avatar_${index}`,
              extension: "png",
            },
          },
        ],
        actorCount: 1,
        eventCount: 1,
        preview: null,
        target: { type: NotificationProfileTargetDto.type.PROFILE, id: "u" },
        lastEventAt: "2026-10-25T12:00:00Z",
        version: 1,
        readVersion: 1,
      }),
    );

    const { container } = renderUI(
      <>
        {items.map((item) => (
          <InboxNotificationItem key={item.id} item={item} />
        ))}
      </>,
    );

    expect(container.querySelectorAll('img[src^="avatar_"]')).toHaveLength(10);
    expect(
      ProfileService.profileControllerFindOneByIdV1,
    ).not.toHaveBeenCalled();
  });
});

describe("Notification Inbox - Target navigation", () => {
  it.each([
    ["post", "/posts?postId=post-456", { type: "post", id: "post-456" }],
    [
      "activity",
      "/activity/detail/act-789",
      { type: "activity", id: "act-789" },
    ],
    ["profile", "/profile/user-101", { type: "profile", id: "user-101" }],
    [
      "importer",
      "/importer/steam",
      { type: "importer", id: "imp-1", provider: "steam" },
    ],
  ])("navigates directly for %s target", async (_, expectedRoute, target) => {
    const onNavigate = vi.fn();
    const item: NotificationInboxItemDto = {
      id: 10,
      type: "content.liked",
      actors: [{ userId: "u1", username: "alice" }],
      actorCount: 1,
      eventCount: 1,
      preview: { text: "Liked" },
      target: target as unknown as
        | NotificationContentTargetDto
        | NotificationActivityTargetDto
        | NotificationProfileTargetDto
        | NotificationImporterTargetDto
        | import("@repo/wrapper/server").NotificationAchievementTargetDto
        | null,
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 1,
      readVersion: 1,
    };

    renderUI(<InboxNotificationItem item={item} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByText(/alice/i));
    expect(onNavigate).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(expectedRoute);
    });
  });

  it("resolves review target on click to /game/<gameId>?tab=reviews&reviewId=<id>", async () => {
    const onNavigate = vi.fn();
    vi.spyOn(
      ReviewsService,
      "reviewsControllerFindOneByIdV1",
    ).mockResolvedValue({
      id: "rev-333",
      gameId: 777,
    } as unknown as import("@repo/wrapper/server").Review);

    const item: NotificationInboxItemDto = {
      id: 11,
      type: "content.liked",
      actors: [{ userId: "u1", username: "alice" }],
      actorCount: 1,
      eventCount: 1,
      preview: { text: "Liked your review" },
      target: { type: NotificationContentTargetDto.type.REVIEW, id: "rev-333" },
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 1,
      readVersion: 1,
    };

    renderUI(<InboxNotificationItem item={item} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByText(/alice/i));
    expect(onNavigate).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(
        ReviewsService.reviewsControllerFindOneByIdV1,
      ).toHaveBeenCalledWith("rev-333");
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/game/777?tab=reviews&reviewId=rev-333",
      );
    });
  });
});

describe("Notification Inbox - Cursor pagination", () => {
  it("advances pagination with nextCursor only when hasMore is true", async () => {
    const firstPage = {
      data: [
        {
          id: 100,
          type: "profile.followed",
          actors: [{ userId: "u1", username: "alice" }],
          actorCount: 1,
          eventCount: 1,
          preview: null,
          target: { type: "profile", id: "u1" },
          lastEventAt: "2026-10-25T12:00:00Z",
          version: 1,
          readVersion: 1,
        },
      ],
      pagination: { nextCursor: "cursor_page_2", hasMore: true },
      unreadCount: 0,
    };

    const secondPage = {
      data: [
        {
          id: 101,
          type: "profile.followed",
          actors: [{ userId: "u2", username: "bob" }],
          actorCount: 1,
          eventCount: 1,
          preview: null,
          target: { type: "profile", id: "u2" },
          lastEventAt: "2026-10-25T11:00:00Z",
          version: 1,
          readVersion: 1,
        },
      ],
      pagination: { nextCursor: "cursor_page_3", hasMore: false },
      unreadCount: 0,
    };

    const findSpy = vi
      .spyOn(NotificationsService, "notificationsControllerFindAllV1")
      .mockImplementation(((cursor?: string) => {
        if (!cursor) return Promise.resolve(firstPage);
        if (cursor === "cursor_page_2") return Promise.resolve(secondPage);
        return Promise.resolve({
          data: [],
          pagination: { nextCursor: null, hasMore: false },
          unreadCount: 0,
        });
      }) as unknown as typeof NotificationsService.notificationsControllerFindAllV1);

    const client = createTestQueryClient();
    const { result: hookResult } = renderHook(
      () => useInfiniteAggregatedNotifications(10),
      {
        wrapper: function Wrapper({ children }: React.PropsWithChildren) {
          return (
            <QueryClientProvider client={client}>
              {children}
            </QueryClientProvider>
          );
        },
      },
    );

    await waitFor(() => {
      expect(hookResult.current.data?.pages.length).toBe(1);
    });

    expect(findSpy).toHaveBeenCalledWith(undefined, 10, "all");
    expect(hookResult.current.hasNextPage).toBe(true);

    // Fetch next page
    hookResult.current.fetchNextPage();

    await waitFor(() => {
      expect(hookResult.current.data?.pages.length).toBe(2);
    });

    expect(findSpy).toHaveBeenCalledWith("cursor_page_2", 10, "all");
    // On second page, hasMore is false, so hasNextPage must be false
    expect(hookResult.current.hasNextPage).toBe(false);
  });
});

describe("Notification Inbox - Unread indicators and versioned acknowledgements", () => {
  it("derives unread indicator when unreadCount > 0 or readVersion < version", () => {
    const queryClient = createTestQueryClient();

    // unreadCount > 0
    queryClient.setQueryData(
      ["notifications", "aggregated", "infinite", "test-user-id", "all"],
      {
        pages: [
          {
            data: [{ id: 1, version: 1, readVersion: 1 }],
            pagination: { nextCursor: null, hasMore: false },
            unreadCount: 3,
          },
        ],
        pageParams: [undefined],
      },
    );

    const { container, rerender } = renderUI(
      <NotificationsIcon />,
      queryClient,
    );
    expect(
      container.querySelector(".mantine-Indicator-indicator"),
    ).toBeTruthy();

    // unreadCount = 0 but item readVersion < version
    queryClient.setQueryData(
      ["notifications", "aggregated", "infinite", "test-user-id", "all"],
      {
        pages: [
          {
            data: [{ id: 1, version: 2, readVersion: 1 }],
            pagination: { nextCursor: null, hasMore: false },
            unreadCount: 0,
          },
        ],
        pageParams: [undefined],
      },
    );

    rerender(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <NotificationsIcon />
        </MantineProvider>
      </QueryClientProvider>,
    );
    expect(
      container.querySelector(".mantine-Indicator-indicator"),
    ).toBeTruthy();

    // unreadCount = 0 and all items read (readVersion >= version)
    queryClient.setQueryData(
      ["notifications", "aggregated", "infinite", "test-user-id", "all"],
      {
        pages: [
          {
            data: [{ id: 1, version: 2, readVersion: 2 }],
            pagination: { nextCursor: null, hasMore: false },
            unreadCount: 0,
          },
        ],
        pageParams: [undefined],
      },
    );

    rerender(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <NotificationsIcon />
        </MantineProvider>
      </QueryClientProvider>,
    );
    expect(container.querySelector(".mantine-Indicator-indicator")).toBeNull();
  });

  it("acknowledges unread items in batches of at most 100 items and skips already-read items", async () => {
    const acknowledgeSpy = vi
      .spyOn(NotificationsService, "notificationsControllerAcknowledgeReadV1")
      .mockResolvedValue(undefined);

    // Already-read item does not trigger a request
    const alreadyReadResult = await acknowledgeNotificationsRead([
      {
        id: 999,
        type: "content.liked",
        actors: [],
        actorCount: 1,
        eventCount: 1,
        preview: { text: "liked" },
        target: null,
        lastEventAt: "2026-10-25T12:00:00Z",
        version: 3,
        readVersion: 3,
      },
    ]);
    expect(alreadyReadResult).toBe(false);
    expect(acknowledgeSpy).not.toHaveBeenCalled();

    // Generate 150 items with 120 unread
    const items: NotificationInboxItemDto[] = Array.from(
      { length: 150 },
      (_, i) => ({
        id: i + 1,
        type: "content.liked",
        actors: [{ userId: `u${i}`, username: `user_${i}` }],
        actorCount: 1,
        eventCount: 1,
        preview: { text: "liked" },
        target: null,
        lastEventAt: "2026-10-25T12:00:00Z",
        version: 2,
        readVersion: i < 120 ? 1 : 2, // 120 items are unread (readVersion < version)
      }),
    );

    const result = await acknowledgeNotificationsRead(items);
    expect(result).toBe(true);
    expect(acknowledgeSpy).toHaveBeenCalledTimes(2);
    expect(acknowledgeSpy.mock.calls[0][0].items.length).toBe(100);
    expect(acknowledgeSpy.mock.calls[1][0].items.length).toBe(20);
  });
});
