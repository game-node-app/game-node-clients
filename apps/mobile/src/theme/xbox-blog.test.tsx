// @vitest-environment jsdom
import React from "react";
import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@repo/locales";
import type { BlogArticleDto } from "@repo/wrapper/server";
import { cleanup, render, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../packages/ui/src/util";
import { XboxRecentBlogPostsCarousel } from "../../../../packages/ui/src/theme/themes/xbox/screens/XboxRecentBlogPostsCarousel";
import { setupDom } from "../components/mcp/testUtils";

const state = vi.hoisted(() => ({
  posts: [] as BlogArticleDto[],
}));

vi.mock(
  "../../../../packages/ui/src/components/blog/hooks/useBlogPosts",
  () => ({
    useBlogPosts: () => ({
      data: { data: state.posts },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }),
  }),
);

vi.mock(
  "../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({
    useUserProfile: () => ({ data: { username: "Author" } }),
  }),
);

const LinkPresenter = ({ href, children, ...rest }: LinkComponentProps) => (
  <a href={href} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
    {children as ReactNode}
  </a>
);

const hooks = {
  useRouter: () => ({
    pathname: "/",
    back: vi.fn(),
    push: async () => {},
    query: new URLSearchParams(),
  }),
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider language="en">
    <MantineProvider>
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { retry: false, retryDelay: 0 } },
          })
        }
      >
        <UIProvider hooks={hooks} presenters={{ Link: LinkPresenter }}>
          {children}
        </UIProvider>
      </QueryClientProvider>
    </MantineProvider>
  </I18nProvider>
);

const post = (id: string): BlogArticleDto =>
  ({
    id,
    title: `Post ${id}`,
    excerpt: `Excerpt ${id}`,
    profileUserId: "user-1",
    cover: { url: `https://cdn.example/cover-${id}.jpg`, alt: `Post ${id}` },
    publishedAt: "2026-11-01T00:00:00.000Z",
    tags: [],
    review: null,
  }) as unknown as BlogArticleDto;

beforeEach(() => {
  setupDom();
  state.posts = [post("a"), post("b"), post("c"), post("d"), post("e")];
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("xbox recent blog posts", () => {
  it("renders up to four same-size tiles that open their articles", () => {
    render(<XboxRecentBlogPostsCarousel />, { wrapper });

    const section = document.querySelector(
      "[data-console-blog-section]",
    ) as HTMLElement;
    expect(section).toBeTruthy();

    const tiles = Array.from(
      section.querySelectorAll("[data-console-blog-tile]"),
    );
    expect(tiles).toHaveLength(4);
    expect(tiles.map((tile) => tile.getAttribute("href"))).toEqual([
      "/blog/post/a",
      "/blog/post/b",
      "/blog/post/c",
      "/blog/post/d",
    ]);
    expect(within(tiles[0] as HTMLElement).getByText("Post a")).toBeTruthy();
  });

  it("keeps the browse-all link for the full blog", () => {
    render(<XboxRecentBlogPostsCarousel />, { wrapper });

    expect(document.querySelector('a[href="/blog"]')).toBeTruthy();
  });
});
