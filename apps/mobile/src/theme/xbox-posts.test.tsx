// @vitest-environment jsdom
/* eslint-disable react/display-name -- mock components for the test doubles */
import React from "react";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";
import type { ModalComponentProps } from "../../../../packages/ui/src/util";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../packages/ui/src/util";
import { XboxPostsFeedView } from "../../../../packages/ui/src/theme/themes/xbox/screens/XboxPostsFeedView";
import { XboxPostsListItem } from "../../../../packages/ui/src/theme/themes/xbox/screens/XboxPostsListItem";
import { setupDom } from "../components/mcp/testUtils";

const state = vi.hoisted(() => ({
  userId: "u1" as string | undefined,
  isOwnPost: true,
  copy: vi.fn(),
  notify: vi.fn(),
  shareText: vi.fn(),
}));

vi.mock("../../../../packages/ui/src/components/auth/hooks/useUserId", () => ({
  useUserId: () => state.userId,
}));

// --- feed dependencies ------------------------------------------------------
vi.mock(
  "../../../../packages/ui/src/components/blog/hooks/useBlogPosts",
  () => ({
    useBlogPosts: () => ({
      data: {
        data: [
          {
            id: "blog-1",
            title: "Blog post",
            excerpt: "Excerpt",
            profileUserId: "u2",
            cover: { url: "https://cdn.example/cover.jpg", alt: "" },
            publishedAt: "2026-11-01T00:00:00.000Z",
            tags: [],
            review: null,
          },
        ],
      },
    }),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/game/trending/TrendingGamesList",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../../packages/ui/src/components/game/trending/TrendingGamesList")
      >();
    const React = await import("react");
    return {
      ...actual,
      TrendingGamesList: ({ cols }: { cols?: number }) =>
        React.createElement("div", {
          "data-testid": "trending-games",
          "data-cols": cols,
        }),
    };
  },
);
vi.mock(
  "../../../../packages/ui/src/theme/experiences/console/ConsoleBlogSection",
  () => ({
    ConsoleBlogItem: ({ post }: { post: { id: string } }) => (
      <a data-testid={"console-blog-item"} href={`/blog/post/${post.id}`}>
        {post.id}
      </a>
    ),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/posts/editor/GamePostEditor",
  async () => {
    const React = await import("react");
    return {
      GamePostEditor: ({ onPublish }: { onPublish?: () => void }) =>
        React.createElement(
          "div",
          { "data-testid": "post-editor" },
          React.createElement(
            "button",
            { "data-testid": "post-publish", onClick: onPublish },
            "publish",
          ),
        ),
    };
  },
);
vi.mock(
  "../../../../packages/ui/src/components/posts/feed/PostsFeed",
  async () => {
    const React = await import("react");
    return {
      PostsFeed: ({
        criteria,
        targetedPostId,
        withEditor,
        children,
      }: {
        criteria: string;
        targetedPostId?: string;
        withEditor?: boolean;
        children: (props: {
          fetchNextPage: () => Promise<void>;
          isFetching: boolean;
          hasNextPage: boolean;
        }) => React.ReactNode;
      }) =>
        React.createElement(
          "div",
          {
            "data-testid": "posts-feed",
            "data-criteria": criteria,
            "data-targeted": targetedPostId ?? "",
            "data-with-editor": String(withEditor),
          },
          children({
            fetchNextPage: async () => {},
            isFetching: false,
            hasNextPage: true,
          }),
        ),
    };
  },
);

// --- post item dependencies -------------------------------------------------
vi.mock("@tiptap/react", async () => {
  const React = await import("react");
  return {
    useEditor: () => ({}),
    EditorContent: () =>
      React.createElement("div", { "data-testid": "post-content" }),
  };
});
vi.mock(
  "../../../../packages/ui/src/components/comment/view/CommentsView",
  () => ({
    CommentsView: () => null,
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/comment/view/CommentsListView",
  () => ({ CommentsListView: () => null }),
);
vi.mock(
  "../../../../packages/ui/src/components/comment/editor/CommentEditorView",
  () => ({ CommentEditorView: () => null }),
);
vi.mock(
  "../../../../packages/ui/src/components/report/modal/ReportCreateFormModal",
  () => ({ ReportCreateFormModal: () => null }),
);
vi.mock(
  "../../../../packages/ui/src/components/general/ActionConfirm",
  async () => {
    const React = await import("react");
    return {
      ActionConfirm: ({ opened }: { opened: boolean }) =>
        opened
          ? React.createElement("div", { "data-testid": "remove-confirm" })
          : null,
    };
  },
);
vi.mock(
  "../../../../packages/ui/src/components/general/avatar/UserAvatar",
  () => ({
    UserAvatar: () => <span data-testid={"user-avatar"} />,
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({
    useUserProfile: () => ({ data: { username: "alice" } }),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/user-level/hooks/useUserLevel",
  () => ({
    useUserLevel: () => ({ data: { currentLevel: 3 } }),
  }),
);
vi.mock("../../../../packages/ui/src/components/game/hooks/useGame", () => ({
  useGame: () => ({ data: { name: "Elden Ring" } }),
}));
vi.mock(
  "../../../../packages/ui/src/components/game/hooks/useGameCoverImage",
  () => ({
    GAME_COVER_PLACEHOLDER: "/img/game_placeholder.jpeg",
    useGameCoverImage: () => ({
      src: "https://cdn.example/game.jpg",
      onError: vi.fn(),
    }),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/comment/input/ItemCommentsButton",
  () => ({
    ItemCommentsButton: ({
      onClick,
      sourceType,
    }: {
      onClick: () => void;
      sourceType: string;
    }) => (
      <button
        data-testid={"comments-button"}
        data-source-type={sourceType}
        onClick={onClick}
      >
        comments
      </button>
    ),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/statistics/input/ItemLikesButton",
  () => ({
    ItemLikesButton: ({ sourceType }: { sourceType: string }) => (
      <button data-testid={"likes-button"} data-source-type={sourceType}>
        likes
      </button>
    ),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/general/input/ItemDropdown/ItemDropdown",
  async () => {
    const React = await import("react");
    const ItemDropdown = ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", {}, children);
    ItemDropdown.ReportButton = ({
      onClick,
      disabled,
    }: {
      onClick?: () => void;
      disabled?: boolean;
    }) =>
      React.createElement(
        "button",
        { "data-testid": "report-button", disabled, onClick },
        "report",
      );
    ItemDropdown.RemoveButton = ({ onClick }: { onClick?: () => void }) =>
      React.createElement(
        "button",
        { "data-testid": "remove-button", onClick },
        "remove",
      );
    ItemDropdown.EditButton = () => null;
    ItemDropdown.ShareButton = () => null;
    return { ItemDropdown };
  },
);
vi.mock("@mantine/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mantine/hooks")>();
  return {
    ...actual,
    useClipboard: () => ({
      copy: state.copy,
      copied: false,
      reset: vi.fn(),
      error: null,
    }),
  };
});
vi.mock("@mantine/notifications", () => ({
  notifications: { show: state.notify },
}));

const TestLink = ({ href, children, ...rest }: LinkComponentProps) => (
  <a href={href} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
    {children as React.ReactNode}
  </a>
);

const TestModal = ({
  opened,
  onClose,
  title,
  children,
}: ModalComponentProps) =>
  opened ? (
    <div data-testid={"injected-modal"} data-title={title}>
      <button onClick={onClose}>close modal</button>
      {children}
    </div>
  ) : null;

const baseHooks = {
  useRouter: () => ({
    pathname: "/posts",
    back: vi.fn(),
    push: async () => {},
    query: new URLSearchParams(),
  }),
};

const renderWithProviders = (
  ui: React.ReactNode,
  hooks: Record<string, unknown> = baseHooks,
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <I18nProvider language="en">
      <MantineProvider>
        <QueryClientProvider client={queryClient}>
          <UIProvider
            hooks={hooks as never}
            presenters={{ Link: TestLink, Modal: TestModal }}
          >
            {ui}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    </I18nProvider>,
  );
};

beforeEach(() => {
  setupDom();
  state.userId = "u1";
  state.isOwnPost = true;
  state.copy.mockClear();
  state.notify.mockClear();
  state.shareText.mockReset();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Xbox posts feed", () => {
  it("keeps the feed data, pagination slot and tab scopes of PostsFeed", () => {
    const onTabChange = vi.fn();

    renderWithProviders(
      <XboxPostsFeedView
        currentTab={"all"}
        onTabChange={onTabChange}
        targetedPostId={"post-9"}
      >
        {() => <div data-testid={"infinite-loader"} />}
      </XboxPostsFeedView>,
    );

    expect(screen.getByRole("heading", { name: "Posts" })).toBeTruthy();
    const feed = screen.getByTestId("posts-feed");
    expect(feed.getAttribute("data-criteria")).toBe("all");
    expect(feed.getAttribute("data-targeted")).toBe("post-9");
    expect(feed.getAttribute("data-with-editor")).toBe("false");
    expect(screen.getByTestId("infinite-loader")).toBeTruthy();

    const following = screen.getByRole("tab", { name: "Following" });
    expect(following.hasAttribute("disabled")).toBe(true);
    fireEvent.click(following);
    expect(onTabChange).not.toHaveBeenCalled();

    expect(screen.getByTestId("trending-games").getAttribute("data-cols")).toBe(
      "3",
    );
    expect(screen.getByTestId("console-blog-item")).toBeTruthy();
  });

  it("opens the post editor in the injected modal only when signed in", () => {
    const { unmount } = renderWithProviders(
      <XboxPostsFeedView currentTab={"all"} onTabChange={vi.fn()}>
        {() => null}
      </XboxPostsFeedView>,
    );

    fireEvent.click(screen.getByTestId("xbox-feed-create"));

    const modal = screen.getByTestId("injected-modal");
    expect(modal.getAttribute("data-title")).toBe("New post");
    expect(within(modal).getByTestId("post-editor")).toBeTruthy();

    fireEvent.click(within(modal).getByText("close modal"));
    expect(screen.queryByTestId("injected-modal")).toBeNull();

    unmount();
    state.userId = undefined;

    renderWithProviders(
      <XboxPostsFeedView currentTab={"all"} onTabChange={vi.fn()}>
        {() => null}
      </XboxPostsFeedView>,
    );

    expect(screen.queryByTestId("xbox-feed-create")).toBeNull();
    expect(screen.queryByTestId("post-editor")).toBeNull();
  });
});

describe("Xbox posts list item", () => {
  const item = {
    id: "post-1",
    gameId: 42,
    profileUserId: "u1",
    content: "<p>Hello</p>",
    createdAt: "2026-11-01T00:00:00.000Z",
  };

  it("renders the shared actions and opens the comments modal through the injected Modal", () => {
    renderWithProviders(<XboxPostsListItem item={item as never} />);

    expect(screen.getByTestId("post-content")).toBeTruthy();
    expect(screen.getByText("alice")).toBeTruthy();
    expect(screen.getByText("Elden Ring")).toBeTruthy();
    expect(screen.getByTestId("comments-button")).toBeTruthy();
    expect(screen.getByTestId("likes-button")).toBeTruthy();
    expect(
      screen.getByTestId("comments-button").getAttribute("data-source-type"),
    ).toBe("post");
    expect(
      screen.getByTestId("likes-button").getAttribute("data-source-type"),
    ).toBe("post");

    fireEvent.click(screen.getByTestId("comments-button"));

    const modal = screen.getByTestId("injected-modal");
    expect(modal.getAttribute("data-title")).toBe("Comments in this post");
  });

  it("disables report and offers removal on one's own post", () => {
    state.isOwnPost = true;

    renderWithProviders(<XboxPostsListItem item={item as never} />);

    expect(
      (screen.getByTestId("report-button") as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(screen.getByTestId("remove-button")).toBeTruthy();
  });

  it("keeps report enabled and hides removal on another user's post", () => {
    state.userId = "u2";
    state.isOwnPost = false;

    renderWithProviders(<XboxPostsListItem item={item as never} />);

    expect(
      (screen.getByTestId("report-button") as HTMLButtonElement).disabled,
    ).toBe(false);
    expect(screen.queryByTestId("remove-button")).toBeNull();
  });

  it("shares through the platform adapter and falls back to the clipboard", async () => {
    state.shareText.mockResolvedValue(true);

    const { unmount } = renderWithProviders(
      <XboxPostsListItem item={item as never} />,
      { ...baseHooks, shareText: state.shareText },
    );

    fireEvent.click(screen.getByTestId("xbox-post-share"));
    await vi.waitFor(() => {
      expect(state.shareText).toHaveBeenCalledWith(
        "https://gamenode.app/posts?postId=post-1",
      );
    });
    expect(state.copy).not.toHaveBeenCalled();
    expect(state.notify).not.toHaveBeenCalled();

    unmount();
    state.shareText.mockRejectedValue(new Error("sharing unavailable"));

    renderWithProviders(<XboxPostsListItem item={item as never} />, {
      ...baseHooks,
      shareText: state.shareText,
    });

    fireEvent.click(screen.getByTestId("xbox-post-share"));
    await vi.waitFor(() => {
      expect(state.copy).toHaveBeenCalledWith(
        "https://gamenode.app/posts?postId=post-1",
      );
    });
    expect(state.notify).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Link copied!" }),
    );
  });

  it("respects the default withUserProfile and withGameInfo props", () => {
    renderWithProviders(
      <XboxPostsListItem
        item={item as never}
        withUserProfile={false}
        withGameInfo={false}
      />,
    );

    expect(screen.queryByText("alice")).toBeNull();
    expect(screen.queryByText("Elden Ring")).toBeNull();
    expect(screen.getByTestId("comments-button")).toBeTruthy();
  });
});
