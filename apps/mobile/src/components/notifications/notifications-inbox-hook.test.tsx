// @vitest-environment jsdom
import { notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { InfiniteData } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  NotificationInboxItemDto,
  NotificationsResponseDto,
  NotificationsService,
} from "@repo/wrapper/server";
import {
  DEFAULT_NOTIFICATIONS_LIMIT,
  getNotificationsInboxKey,
} from "../../../../../packages/ui/src/components/notifications/hooks/useInfiniteAggregatedNotifications";
import { useNotificationsInbox } from "../../../../../packages/ui/src/components/notifications/hooks/useNotificationsInbox";

const mocks = vi.hoisted(() => ({
  userId: "test-user-id" as string | undefined,
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => mocks.userId }),
);

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchInterval: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function createItem(
  overrides: Partial<NotificationInboxItemDto> & { id: number },
): NotificationInboxItemDto {
  return {
    type: "profile.followed",
    actors: [{ userId: "actor-1", username: "alice" }],
    actorCount: 1,
    eventCount: 1,
    preview: null,
    target: null,
    lastEventAt: "2026-11-11T10:00:00.000Z",
    version: 1,
    readVersion: 1,
    ...overrides,
  };
}

function createPage(
  data: NotificationInboxItemDto[],
  {
    nextCursor = null,
    hasMore = false,
    unreadCount = 0,
  }: {
    nextCursor?: string | null;
    hasMore?: boolean;
    unreadCount?: number;
  } = {},
): NotificationsResponseDto {
  return { data, pagination: { nextCursor, hasMore }, unreadCount };
}

function seedInbox(
  client: QueryClient,
  filter: "all" | "unread",
  page: NotificationsResponseDto,
) {
  client.setQueryData<InfiniteData<NotificationsResponseDto>>(
    getNotificationsInboxKey(mocks.userId, filter),
    { pages: [page], pageParams: [undefined] },
  );
}

function readInboxItems(
  client: QueryClient,
  filter: "all" | "unread",
): NotificationInboxItemDto[] {
  const data = client.getQueryData<InfiniteData<NotificationsResponseDto>>(
    getNotificationsInboxKey(mocks.userId, filter),
  );
  return data?.pages.flatMap((page) => page.data) ?? [];
}

function readInboxItem(
  client: QueryClient,
  filter: "all" | "unread",
  id: number,
) {
  return readInboxItems(client, filter).find((item) => item.id === id);
}

function readUnreadCount(client: QueryClient, filter: "all" | "unread") {
  return client.getQueryData<InfiniteData<NotificationsResponseDto>>(
    getNotificationsInboxKey(mocks.userId, filter),
  )?.pages[0]?.unreadCount;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.userId = "test-user-id";
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useInfiniteAggregatedNotifications", () => {
  it("sends the selected filter to the service and keeps a separate key per filter", async () => {
    const client = createClient();
    const findAll = vi
      .spyOn(NotificationsService, "notificationsControllerFindAllV1")
      .mockResolvedValue(createPage([], { unreadCount: 0 }) as never);

    expect(getNotificationsInboxKey("test-user-id")).toEqual([
      "notifications",
      "aggregated",
      "infinite",
      "test-user-id",
      "all",
    ]);
    expect(getNotificationsInboxKey("test-user-id", "unread")).not.toEqual(
      getNotificationsInboxKey("test-user-id", "all"),
    );

    renderHook(() => useNotificationsInbox({ filter: "all" }), {
      wrapper: createWrapper(client),
    });
    renderHook(() => useNotificationsInbox({ filter: "unread" }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => {
      expect(findAll).toHaveBeenCalledWith(
        undefined,
        DEFAULT_NOTIFICATIONS_LIMIT,
        "all",
      );
      expect(findAll).toHaveBeenCalledWith(
        undefined,
        DEFAULT_NOTIFICATIONS_LIMIT,
        "unread",
      );
    });
  });

  it("uses the cursor of the tab being paginated", async () => {
    const client = createClient();
    const unreadFirst = createPage([createItem({ id: 1 })], {
      nextCursor: "page-2",
      hasMore: true,
      unreadCount: 1,
    });
    const unreadSecond = createPage([createItem({ id: 2 })], {
      unreadCount: 1,
    });

    const findAll = vi
      .spyOn(NotificationsService, "notificationsControllerFindAllV1")
      .mockImplementation(((
        cursor?: string,
        _limit?: number,
        filter?: string,
      ) => {
        if (filter === "unread") {
          return Promise.resolve(cursor ? unreadSecond : unreadFirst);
        }
        return Promise.resolve(createPage([], { unreadCount: 0 }));
      }) as never);

    const hook = renderHook(() => useNotificationsInbox({ filter: "unread" }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => {
      expect(hook.result.current.isLoading).toBe(false);
      expect(hook.result.current.hasNextPage).toBe(true);
    });

    await act(async () => {
      await hook.result.current.fetchNextPage();
    });

    expect(findAll).toHaveBeenCalledWith(
      "page-2",
      DEFAULT_NOTIFICATIONS_LIMIT,
      "unread",
    );
    expect(findAll).not.toHaveBeenCalledWith(
      "page-2",
      DEFAULT_NOTIFICATIONS_LIMIT,
      "all",
    );
    expect(readInboxItems(client, "unread").map((item) => item.id)).toEqual([
      1, 2,
    ]);
  });

  it("keeps hasNextPage while the server returns empty pages with more results", async () => {
    const client = createClient();
    const emptyFirst = createPage([], {
      nextCursor: "page-2",
      hasMore: true,
      unreadCount: 0,
    });
    const filledSecond = createPage(
      [createItem({ id: 2, lastEventAt: new Date().toISOString() })],
      { unreadCount: 1 },
    );

    vi.spyOn(
      NotificationsService,
      "notificationsControllerFindAllV1",
    ).mockImplementation(((cursor?: string) =>
      Promise.resolve(cursor ? filledSecond : emptyFirst)) as never);

    const hook = renderHook(() => useNotificationsInbox({ filter: "unread" }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => {
      expect(hook.result.current.isLoading).toBe(false);
    });

    expect(hook.result.current.sections).toEqual([]);
    expect(hook.result.current.hasNextPage).toBe(true);

    await act(async () => {
      await hook.result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(hook.result.current.sections).toHaveLength(1);
    });
    expect(hook.result.current.sections[0].items).toHaveLength(1);
    expect(hook.result.current.hasNextPage).toBe(false);
  });
});

describe("useNotificationsInbox - mark all as read", () => {
  function seedBothFilters(client: QueryClient) {
    const older = createItem({
      id: 1,
      lastEventAt: "2026-11-11T08:00:00.000Z",
      version: 2,
      readVersion: 1,
    });
    const newest = createItem({
      id: 2,
      lastEventAt: "2026-11-11T12:00:00.000Z",
      version: 3,
      readVersion: 1,
    });
    const unreadTabItem = createItem({
      id: 3,
      lastEventAt: "2026-11-11T12:30:00.000Z",
      version: 1,
      readVersion: 0,
    });

    seedInbox(client, "all", createPage([newest, older], { unreadCount: 2 }));
    seedInbox(
      client,
      "unread",
      createPage([unreadTabItem], { unreadCount: 1 }),
    );

    return { older, newest, unreadTabItem };
  }

  it("sends a single read-all request with the greatest cached lastEventAt, updates optimistically and uses the returned unreadCount", async () => {
    const client = createClient();
    const { older, newest, unreadTabItem } = seedBothFilters(client);

    const findAll = vi
      .spyOn(NotificationsService, "notificationsControllerFindAllV1")
      .mockResolvedValue(
        createPage([newest, older], { unreadCount: 2 }) as never,
      );
    const readAll = deferred<{ success: boolean; unreadCount: number }>();
    const readAllSpy = vi
      .spyOn(
        NotificationsService,
        "notificationsControllerAcknowledgeReadAllV1",
      )
      .mockReturnValue(readAll.promise as never);

    const hook = renderHook(() => useNotificationsInbox({ filter: "all" }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => {
      expect(hook.result.current.isLoading).toBe(false);
    });
    // The invalidation that follows read-all must not replace the optimistic
    // cache with a stale server response before we assert it.
    findAll.mockReturnValue(new Promise<never>(() => {}) as never);

    act(() => {
      hook.result.current.markAllAsRead();
    });

    await waitFor(() => {
      expect(readAllSpy).toHaveBeenCalledTimes(1);
    });
    expect(readAllSpy).toHaveBeenCalledWith({
      before: "2026-11-11T12:30:00.000Z",
    });

    // Optimistic: every item up to `before` is read and both filters are zeroed.
    expect(hook.result.current.isMarkingAll).toBe(true);
    expect(readInboxItem(client, "all", older.id)?.readVersion).toBe(
      older.version,
    );
    expect(readInboxItem(client, "all", newest.id)?.readVersion).toBe(
      newest.version,
    );
    expect(readInboxItem(client, "unread", unreadTabItem.id)?.readVersion).toBe(
      unreadTabItem.version,
    );
    expect(readUnreadCount(client, "all")).toBe(0);
    expect(readUnreadCount(client, "unread")).toBe(0);

    readAll.resolve({ success: true, unreadCount: 4 });

    await waitFor(() => {
      expect(readUnreadCount(client, "all")).toBe(4);
    });
    expect(readUnreadCount(client, "unread")).toBe(4);
    await waitFor(() => {
      expect(hook.result.current.isMarkingAll).toBe(false);
    });
  });

  it("rolls both filters back and shows an error notification when read-all fails", async () => {
    const client = createClient();
    const { older, newest, unreadTabItem } = seedBothFilters(client);

    const findAll = vi
      .spyOn(NotificationsService, "notificationsControllerFindAllV1")
      .mockResolvedValue(
        createPage([newest, older], { unreadCount: 2 }) as never,
      );
    const readAll = deferred<unknown>();
    const readAllSpy = vi
      .spyOn(
        NotificationsService,
        "notificationsControllerAcknowledgeReadAllV1",
      )
      .mockReturnValue(readAll.promise as never);

    const hook = renderHook(() => useNotificationsInbox({ filter: "all" }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => {
      expect(hook.result.current.isLoading).toBe(false);
    });
    findAll.mockReturnValue(new Promise<never>(() => {}) as never);

    act(() => {
      hook.result.current.markAllAsRead();
    });
    await waitFor(() => {
      expect(readAllSpy).toHaveBeenCalledTimes(1);
    });

    readAll.reject(new Error("read-all failed"));

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalled();
    });

    expect(readInboxItem(client, "all", older.id)?.readVersion).toBe(
      older.readVersion,
    );
    expect(readInboxItem(client, "all", newest.id)?.readVersion).toBe(
      newest.readVersion,
    );
    expect(readInboxItem(client, "unread", unreadTabItem.id)?.readVersion).toBe(
      unreadTabItem.readVersion,
    );
    expect(readUnreadCount(client, "all")).toBe(2);
    expect(readUnreadCount(client, "unread")).toBe(1);
  });
});

describe("useNotificationsInbox - mark one as read", () => {
  it("acknowledges the item and optimistically clears it from both filters", async () => {
    const client = createClient();
    const item = createItem({
      id: 5,
      lastEventAt: "2026-11-11T10:00:00.000Z",
      version: 2,
      readVersion: 1,
    });
    seedInbox(client, "all", createPage([item], { unreadCount: 3 }));
    seedInbox(client, "unread", createPage([item], { unreadCount: 1 }));

    const acknowledge = deferred<unknown>();
    const acknowledgeSpy = vi
      .spyOn(NotificationsService, "notificationsControllerAcknowledgeReadV1")
      .mockReturnValue(acknowledge.promise as never);

    const hook = renderHook(() => useNotificationsInbox({ filter: "all" }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => {
      expect(hook.result.current.isLoading).toBe(false);
    });

    act(() => {
      hook.result.current.markAsRead(item);
    });

    await waitFor(() => {
      expect(acknowledgeSpy).toHaveBeenCalledWith({
        items: [{ id: item.id, version: item.version }],
      });
    });

    expect(readInboxItem(client, "all", item.id)?.readVersion).toBe(
      item.version,
    );
    expect(readInboxItem(client, "unread", item.id)?.readVersion).toBe(
      item.version,
    );
    expect(readUnreadCount(client, "all")).toBe(2);
    expect(readUnreadCount(client, "unread")).toBe(0);

    acknowledge.resolve(undefined);
    await waitFor(() => {
      expect(hook.result.current.isFetching).toBe(false);
    });
  });
});
