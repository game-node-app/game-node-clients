// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
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
  ReviewsService,
} from "@repo/wrapper/server";
import {
  acknowledgeNotificationsRead,
  AggregatedNotification,
  useInfiniteAggregatedNotifications,
} from "../../../../../packages/ui/src/components/notifications";
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
    t: (key: string) => key,
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
        { userId: "u1", username: "alice", avatar: { id: 10, filename: "alice_avatar" } },
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

    renderUI(
      <AggregatedNotification
        aggregatedNotification={item}
        backgroundColor="normal"
        onClick={vi.fn()}
      />,
    );

    // Actor names
    expect(screen.getByText(/alice, bob/i)).toBeTruthy();
    // Remaining count = 4 - 2 = 2
    expect(screen.getByText(/and 2 others/i)).toBeTruthy();
    // Preview text lowercased
    expect(screen.getByText(/liked your post/i)).toBeTruthy();
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
        game: { id: 99, name: "Chrono Trigger", slug: "chrono-trigger" },
      },
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 1,
      readVersion: 1,
    };

    renderUI(
      <AggregatedNotification
        aggregatedNotification={item}
        backgroundColor="normal"
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText(/alice/i)).toBeTruthy();
    expect(screen.getByText(/liked your activity of Chrono Trigger/i)).toBeTruthy();
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

    renderUI(
      <AggregatedNotification
        aggregatedNotification={item}
        backgroundColor="normal"
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText(/alice/i)).toBeTruthy();
    expect(screen.getByText(/commented on your review: "Great review!"/i)).toBeTruthy();
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

    renderUI(
      <AggregatedNotification
        aggregatedNotification={item}
        backgroundColor="normal"
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText(/bob/i)).toBeTruthy();
    expect(screen.getByText(/replied to your comment: "I agree with this"/i)).toBeTruthy();
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

    renderUI(
      <AggregatedNotification
        aggregatedNotification={item}
        backgroundColor="normal"
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText(/charlie/i)).toBeTruthy();
    expect(screen.getByText(/has started following you\./i)).toBeTruthy();
  });

  it("renders import.discovery-completed with provider icon, discovery counts, and sampled titles without entity queries", () => {
    const item: NotificationInboxItemDto = {
      id: 6,
      type: "import.discovery-completed",
      actors: [],
      actorCount: 0,
      eventCount: 1,
      preview: {
        provider: "steam" as any,
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
        provider: "steam" as any,
      },
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 1,
      readVersion: 1,
    };

    renderUI(
      <AggregatedNotification
        aggregatedNotification={item}
        backgroundColor="normal"
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText(/15 new games ready to be imported from your Steam connection/i)).toBeTruthy();
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
        action: "suspension" as any,
        reason: "Inappropriate review text",
      },
      target: null,
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 1,
      readVersion: 1,
    };

    renderUI(
      <AggregatedNotification
        aggregatedNotification={item}
        backgroundColor="normal"
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText("reports.messages.suspend")).toBeTruthy();
    expect(screen.getByText("Inappropriate review text")).toBeTruthy();
    expect(screen.getByText("reports.messages.contentDeleted")).toBeTruthy();
    expect(screen.getByText("reports.messages.appeal")).toBeTruthy();
  });
});

describe("Notification Inbox - Target navigation", () => {
  it.each([
    ["post", "/posts?postId=post-456", { type: "post", id: "post-456" }],
    ["activity", "/activity/detail/act-789", { type: "activity", id: "act-789" }],
    ["profile", "/profile/user-101", { type: "profile", id: "user-101" }],
    ["importer", "/importer/steam", { type: "importer", id: "imp-1", provider: "steam" }],
  ])("navigates directly for %s target", async (_, expectedRoute, target) => {
    const onClick = vi.fn();
    const item: NotificationInboxItemDto = {
      id: 10,
      type: "content.liked",
      actors: [{ userId: "u1", username: "alice" }],
      actorCount: 1,
      eventCount: 1,
      preview: { text: "Liked" },
      target: target as any,
      lastEventAt: "2026-10-25T12:00:00Z",
      version: 1,
      readVersion: 1,
    };

    renderUI(
      <AggregatedNotification
        aggregatedNotification={item}
        backgroundColor="normal"
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByText(/alice/i));
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(expectedRoute);
    });
  });

  it("resolves review target on click to /game/<gameId>?tab=reviews&reviewId=<id>", async () => {
    const onClick = vi.fn();
    vi.spyOn(ReviewsService, "reviewsControllerFindOneByIdV1").mockResolvedValue({
      id: "rev-333",
      gameId: 777,
    } as any);

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

    renderUI(
      <AggregatedNotification
        aggregatedNotification={item}
        backgroundColor="normal"
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByText(/alice/i));
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(ReviewsService.reviewsControllerFindOneByIdV1).toHaveBeenCalledWith("rev-333");
      expect(mockRouter.push).toHaveBeenCalledWith("/game/777?tab=reviews&reviewId=rev-333");
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
        if (!cursor) return Promise.resolve(firstPage) as any;
        if (cursor === "cursor_page_2") return Promise.resolve(secondPage) as any;
        return Promise.resolve({ data: [], pagination: { nextCursor: null, hasMore: false }, unreadCount: 0 }) as any;
      }) as any);

    let hookResult!: ReturnType<typeof useInfiniteAggregatedNotifications>;
    function TestPaginationComponent() {
      hookResult = useInfiniteAggregatedNotifications(10);
      return <div>Loaded {hookResult.data?.pages.length ?? 0} pages</div>;
    }

    renderUI(<TestPaginationComponent />);

    await waitFor(() => {
      expect(hookResult.data?.pages.length).toBe(1);
    });

    expect(findSpy).toHaveBeenCalledWith(undefined, 10);
    expect(hookResult.hasNextPage).toBe(true);

    // Fetch next page
    hookResult.fetchNextPage();

    await waitFor(() => {
      expect(hookResult.data?.pages.length).toBe(2);
    });

    expect(findSpy).toHaveBeenCalledWith("cursor_page_2", 10);
    // On second page, hasMore is false, so hasNextPage must be false
    expect(hookResult.hasNextPage).toBe(false);
  });
});

describe("Notification Inbox - Unread indicators and versioned acknowledgements", () => {
  it("derives unread indicator when unreadCount > 0 or readVersion < version", () => {
    const queryClient = createTestQueryClient();

    // unreadCount > 0
    queryClient.setQueryData(["notifications", "aggregated", "infinite", "test-user-id"], {
      pages: [
        {
          data: [{ id: 1, version: 1, readVersion: 1 }],
          pagination: { nextCursor: null, hasMore: false },
          unreadCount: 3,
        },
      ],
      pageParams: [undefined],
    });

    const { container, rerender } = renderUI(<NotificationsIcon />, queryClient);
    expect(container.querySelector(".mantine-Indicator-indicator")).toBeTruthy();

    // unreadCount = 0 but item readVersion < version
    queryClient.setQueryData(["notifications", "aggregated", "infinite", "test-user-id"], {
      pages: [
        {
          data: [{ id: 1, version: 2, readVersion: 1 }],
          pagination: { nextCursor: null, hasMore: false },
          unreadCount: 0,
        },
      ],
      pageParams: [undefined],
    });

    rerender(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <NotificationsIcon />
        </MantineProvider>
      </QueryClientProvider>,
    );
    expect(container.querySelector(".mantine-Indicator-indicator")).toBeTruthy();

    // unreadCount = 0 and all items read (readVersion >= version)
    queryClient.setQueryData(["notifications", "aggregated", "infinite", "test-user-id"], {
      pages: [
        {
          data: [{ id: 1, version: 2, readVersion: 2 }],
          pagination: { nextCursor: null, hasMore: false },
          unreadCount: 0,
        },
      ],
      pageParams: [undefined],
    });

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
      .mockResolvedValue({} as any);

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
    const items: NotificationInboxItemDto[] = Array.from({ length: 150 }, (_, i) => ({
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
    }));

    const result = await acknowledgeNotificationsRead(items);
    expect(result).toBe(true);
    expect(acknowledgeSpy).toHaveBeenCalledTimes(2);
    expect(acknowledgeSpy.mock.calls[0][0].items.length).toBe(100);
    expect(acknowledgeSpy.mock.calls[1][0].items.length).toBe(20);
  });
});
