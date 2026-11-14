// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import type { InfiniteData } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FollowService,
  NotificationInboxItemDto,
  NotificationsResponseDto,
  NotificationsService,
  ProfileService,
} from "@repo/wrapper/server";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import { getNotificationsInboxKey } from "../../../../../packages/ui/src/components/notifications/hooks/useInfiniteAggregatedNotifications";
import { useFollowBackNotification } from "../../../../../packages/ui/src/components/notifications/hooks/useFollowBackNotification";
import { useNotificationsInbox } from "../../../../../packages/ui/src/components/notifications/hooks/useNotificationsInbox";
import { InboxNotificationItem } from "../../../../../packages/ui/src/components/notifications/view/InboxNotificationItem";

const mockRouter = vi.hoisted(() => ({
  push: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../../packages/ui/src/util/link", () => ({
  useRouter: () => mockRouter,
}));

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

      const value = lookup(enTranslations, key);
      if (typeof value !== "string") return key;

      return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
        String(options?.[name] ?? ""),
      );
    },
  }),
}));

const mocks = vi.hoisted(() => ({
  userId: "own-user-id" as string | undefined,
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
    readVersion: 0,
    ...overrides,
  };
}

function createPage(
  data: NotificationInboxItemDto[],
): NotificationsResponseDto {
  return {
    data,
    pagination: { nextCursor: null, hasMore: false },
    unreadCount: data.filter((item) => item.readVersion < item.version).length,
  };
}

function seedInbox(
  client: QueryClient,
  filter: "all" | "unread",
  items: NotificationInboxItemDto[],
) {
  client.setQueryData<InfiniteData<NotificationsResponseDto>>(
    getNotificationsInboxKey(mocks.userId, filter),
    { pages: [createPage(items)], pageParams: [undefined] },
  );
}

function readActors(client: QueryClient, filter: "all" | "unread") {
  const data = client.getQueryData<InfiniteData<NotificationsResponseDto>>(
    getNotificationsInboxKey(mocks.userId, filter),
  );
  return (
    data?.pages.flatMap((page) =>
      page.data.flatMap((item) =>
        item.actors.map((actor) => ({ itemId: item.id, ...actor })),
      ),
    ) ?? []
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.userId = "own-user-id";
  vi.spyOn(console, "error").mockImplementation(() => {});
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

describe("useFollowBackNotification", () => {
  it("follows the actor, hides the action in every cached inbox item and does not acknowledge the notification as read", async () => {
    const client = createClient();
    const firstItem = createItem({
      id: 1,
      actors: [
        { userId: "actor-1", username: "alice", isFollowedByRecipient: false },
        { userId: "actor-2", username: "bob", isFollowedByRecipient: false },
      ],
      actorCount: 2,
    });
    const secondItem = createItem({
      id: 2,
      actors: [
        { userId: "actor-1", username: "alice", isFollowedByRecipient: false },
      ],
    });
    const unreadItem = createItem({
      id: 3,
      actors: [
        { userId: "actor-1", username: "alice", isFollowedByRecipient: false },
      ],
    });
    seedInbox(client, "all", [firstItem, secondItem]);
    seedInbox(client, "unread", [unreadItem]);

    const pending = deferred<Record<string, unknown>>();
    const followSpy = vi
      .spyOn(FollowService, "followControllerRegisterFollowV1")
      .mockReturnValue(pending.promise as never);
    const acknowledgeSpy = vi.spyOn(
      NotificationsService,
      "notificationsControllerAcknowledgeReadV1",
    );
    const readAllSpy = vi.spyOn(
      NotificationsService,
      "notificationsControllerAcknowledgeReadAllV1",
    );

    const hook = renderHook(() => useFollowBackNotification(), {
      wrapper: createWrapper(client),
    });

    act(() => {
      hook.result.current.followBack("actor-1");
    });

    await waitFor(() => {
      expect(followSpy).toHaveBeenCalledWith({ followedUserId: "actor-1" });
    });

    // Optimistic: the button disappears from every item of that actor, in both
    // filters, without touching other actors or acknowledging reads.
    expect(hook.result.current.isPending).toBe(true);
    for (const actor of readActors(client, "all")) {
      expect(actor.isFollowedByRecipient).toBe(
        actor.userId === "actor-1" ? true : false,
      );
    }
    expect(readActors(client, "unread")[0].isFollowedByRecipient).toBe(true);
    expect(acknowledgeSpy).not.toHaveBeenCalled();
    expect(readAllSpy).not.toHaveBeenCalled();

    pending.resolve({});

    await waitFor(() => {
      expect(hook.result.current.isPending).toBe(false);
    });
  });

  it("rolls the actor flags back and shows an error notification when following fails", async () => {
    const client = createClient();
    const item = createItem({
      id: 1,
      actors: [
        { userId: "actor-1", username: "alice", isFollowedByRecipient: false },
        { userId: "actor-2", username: "bob", isFollowedByRecipient: true },
      ],
      actorCount: 2,
    });
    seedInbox(client, "all", [item]);

    const pending = deferred<Record<string, unknown>>();
    vi.spyOn(FollowService, "followControllerRegisterFollowV1").mockReturnValue(
      pending.promise as never,
    );

    const hook = renderHook(() => useFollowBackNotification(), {
      wrapper: createWrapper(client),
    });

    act(() => {
      hook.result.current.followBack("actor-1");
    });

    await waitFor(() => {
      expect(
        readActors(client, "all").find((actor) => actor.userId === "actor-1")
          ?.isFollowedByRecipient,
      ).toBe(true);
    });

    pending.reject(new Error("follow failed"));

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(hook.result.current.isPending).toBe(false);
    });

    expect(
      readActors(client, "all").find((actor) => actor.userId === "actor-1")
        ?.isFollowedByRecipient,
    ).toBe(false);
    expect(
      readActors(client, "all").find((actor) => actor.userId === "actor-2")
        ?.isFollowedByRecipient,
    ).toBe(true);
  });

  it("invalidates only the follow status of the actor after settling", async () => {
    const client = createClient();
    const item = createItem({ id: 1 });
    seedInbox(client, "all", [item]);
    client.setQueryData(["follow", "status", "own-user-id", "actor-1"], {
      isFollowing: false,
    });

    vi.spyOn(
      FollowService,
      "followControllerRegisterFollowV1",
    ).mockResolvedValue({} as never);
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const hook = renderHook(() => useFollowBackNotification(), {
      wrapper: createWrapper(client),
    });

    act(() => {
      hook.result.current.followBack("actor-1");
    });

    await waitFor(() => {
      expect(hook.result.current.isPending).toBe(false);
    });
    await waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: ["follow", "status", "own-user-id", "actor-1"],
      });
    });

    expect(invalidate).not.toHaveBeenCalledWith({
      queryKey: ["notifications", "aggregated"],
    });
  });
});

function InboxItemHarness() {
  const { sections } = useNotificationsInbox({ filter: "all" });
  const item = sections[0]?.items[0];

  return item ? <InboxNotificationItem item={item} /> : null;
}

describe("InboxNotificationItem - follow back action", () => {
  it("hides the action after following without navigating or acknowledging the item", async () => {
    const client = createClient();
    seedInbox(client, "all", [
      createItem({
        id: 1,
        actors: [
          {
            userId: "actor-1",
            username: "alice",
            isFollowedByRecipient: false,
          },
        ],
      }),
    ]);

    const followSpy = vi
      .spyOn(FollowService, "followControllerRegisterFollowV1")
      .mockResolvedValue({} as never);
    const acknowledgeSpy = vi.spyOn(
      NotificationsService,
      "notificationsControllerAcknowledgeReadV1",
    );
    const profileSpy = vi
      .spyOn(ProfileService, "profileControllerFindOneByIdV1")
      .mockResolvedValue({} as never);

    render(
      <QueryClientProvider client={client}>
        <MantineProvider>
          <InboxItemHarness />
        </MantineProvider>
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Follow back" }));

    await waitFor(() => {
      expect(followSpy).toHaveBeenCalledWith({ followedUserId: "actor-1" });
    });

    expect(acknowledgeSpy).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(profileSpy).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Follow back" })).toBeNull();
    });
  });
});
