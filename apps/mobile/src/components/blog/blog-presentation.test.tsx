// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import {
  cleanup,
  fireEvent,
  render as renderDom,
  screen,
  within,
  type RenderOptions,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Fragment, type ReactElement } from "react";
import { renderToString as renderServer } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { BlogArticleDto, BlogListResponseDto } from "@repo/wrapper/server";
import { MobileBlogArticleLanguageLink } from "./MobileBlogArticleLanguageLink";
import { BlogPostDetailView } from "../../../../../packages/ui/src/components/blog/view/BlogPostDetailView";
import { BlogArticleView } from "../../../../../packages/ui/src/components/blog/view/BlogArticleView";
import { BlogPostsCategorySection } from "../../../../../packages/ui/src/components/blog/feed/BlogPostsCategorySection";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { draft, english, fallback, portuguese } from "./fixtures";
const reading = vi.hoisted(() => ({
  query: {} as {
    data?: import("@repo/wrapper/server").BlogArticleDto;
    isLoading?: boolean;
    isError?: boolean;
    error?: { status: number };
    refetch?: () => void;
  },
  categoryQuery: {} as {
    data?: BlogListResponseDto;
    isError?: boolean;
  },
  setLanguage: vi.fn(),
}));
const lightbox = vi.hoisted(() => ({
  openLightbox: vi.fn(),
  registerImage: vi.fn(),
  unregisterImage: vi.fn(),
}));
vi.mock("@repo/locales", () => ({
  DEFAULT_LANGUAGE: "en",
  SUPPORTED_LANGUAGES: ["en", "pt-BR", "es", "ja"],
  useTranslation: () => ({ t: (key: string) => key }),
  useI18nContext: () => ({ setLanguage: reading.setLanguage }),
}));
vi.mock("../../../../../packages/ui/src/components", async () => ({
  ...(await import("../../../../../packages/ui/src/components/blog/constants")),
  useBlogPost: () => reading.query,
  useBlogPosts: () => reading.categoryQuery,
  BlogPostCard: ({ post }: { post: BlogArticleDto }) => <p>{post.title}</p>,
  CenteredLoading: () => <span>Loading</span>,
  UserAvatarGroup: () => null,
  BlogPostTags: () => null,
  BlogPostReviewInfo: ({ reviewInfo }: { reviewInfo: { rating: number } }) => (
    <span>Rating {reviewInfo.rating}</span>
  ),
  PostImageLightboxContext: ({ children }: import("react").PropsWithChildren) =>
    children,
  usePostImageLightboxContext: () => lightbox,
}));

function render(
  element: ReactElement,
  { wrapper: Wrapper = Fragment }: RenderOptions = {},
) {
  return renderDom(element, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">
        <Wrapper>{children}</Wrapper>
      </MantineProvider>
    ),
  });
}

function renderToString(element: ReactElement) {
  return renderServer(<MantineProvider env="test">{element}</MantineProvider>);
}

const multilingual = {
  ...english,
  availableLocales: ["en", "pt-BR", "es", "es", "ja", "de"],
} as BlogArticleDto;

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
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
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
it("includes sanitized article markup in SSR and expands images by keyboard", () => {
  const html = renderToString(
    <BlogArticleView
      post={
        english as unknown as
          | import("@repo/wrapper/server").BlogArticleDto
          | import("@repo/wrapper/server").BlogPreviewDto
      }
    />,
  );
  expect(html).toContain("English body");
  expect(html).toContain('lang="en"');
  render(
    <BlogArticleView
      post={
        english as unknown as
          | import("@repo/wrapper/server").BlogArticleDto
          | import("@repo/wrapper/server").BlogPreviewDto
      }
    />,
  );
  const image = screen.getByAltText("Gameplay");
  expect(image.tabIndex).toBe(0);
  fireEvent.keyDown(image, { key: "Enter" });
  expect(lightbox.openLightbox).toHaveBeenCalledWith(
    "https://media.example/inline.webp",
  );
  expect(screen.getByText("Rating 0")).toBeTruthy();
});
it.each([
  {
    post: english,
    label: "Português (Brasil)",
    locale: "pt-BR",
    prefix: "/pt-BR",
  },
  { post: portuguese, label: "English", locale: "en", prefix: "" },
])(
  "links to the alternate $locale version using its full language name",
  ({ post, label, locale, prefix }) => {
    render(<BlogArticleView post={post as BlogArticleDto} />);

    const link = screen.getByRole("link", { name: /English|Português/ });
    expect(link.textContent).toBe(label);
    expect(link.getAttribute("href")).toBe(`${prefix}/blog/post/${post.id}`);
    expect(link.getAttribute("hreflang")).toBe(locale);
    expect(link.getAttribute("lang")).toBe(locale);
    expect(screen.getByText("blog.read.alsoAvailable")).toBeTruthy();
  },
);

it("opens one keyboard-accessible menu with all distinct supported alternatives", async () => {
  const user = userEvent.setup();
  render(<BlogArticleView post={multilingual} />);

  const trigger = screen.getByRole("button", {
    name: "blog.read.chooseLanguage",
  });
  expect(screen.queryByRole("menu")).toBeNull();
  trigger.focus();
  await user.keyboard("{Enter}");

  const menu = within(await screen.findByRole("menu"));
  const items = menu.getAllByRole("menuitem");
  expect(items.map((item) => item.textContent)).toEqual([
    "Português (Brasil)",
    "Español",
    "日本語",
  ]);
  expect(items.map((item) => item.getAttribute("href"))).toEqual([
    `/pt-BR/blog/post/${english.id}`,
    `/es/blog/post/${english.id}`,
    `/ja/blog/post/${english.id}`,
  ]);
  expect(items.map((item) => item.getAttribute("hreflang"))).toEqual([
    "pt-BR",
    "es",
    "ja",
  ]);
  await user.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(items[0]);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it("hides the language prompt when the requested version is the only one", () => {
  render(
    <BlogArticleView
      post={{ ...english, availableLocales: ["en"] } as BlogArticleDto}
    />,
  );

  expect(screen.queryByText("blog.read.alsoAvailable")).toBeNull();
  expect(screen.queryByRole("link", { name: /English|Português/ })).toBeNull();
});

it("explains a fallback and links to the published version", () => {
  render(
    <BlogArticleView
      post={
        fallback as unknown as
          | import("@repo/wrapper/server").BlogArticleDto
          | import("@repo/wrapper/server").BlogPreviewDto
      }
    />,
  );
  expect(screen.getByRole("status").textContent).toBe("blog.read.fallback");
  expect(screen.queryByRole("link", { name: "Português (Brasil)" })).toBeNull();
  expect(
    screen.getByRole("link", { name: "English" }).getAttribute("href"),
  ).toBe(`/blog/post/${english.id}`);
});
it("presents an unpublished exact-locale preview with its real draft state", () => {
  const html = renderToString(
    <BlogArticleView
      post={
        draft as unknown as
          | import("@repo/wrapper/server").BlogArticleDto
          | import("@repo/wrapper/server").BlogPreviewDto
      }
    />,
  );
  expect(html).toContain("Rascunho privado");
  expect(html).toContain("blog.labels.draft");
  expect(html).toContain('lang="pt-BR"');
  expect(html).toContain('href="?locale=en"');
});

it("distinguishes loading, missing and failed detail reads with retry", () => {
  reading.query = { isLoading: true };
  const view = render(<BlogPostDetailView postId="article" />);
  expect(screen.getByText("Loading")).toBeTruthy();
  reading.query = { isError: true, error: { status: 404 } };
  view.rerender(<BlogPostDetailView postId="article" />);
  expect(screen.getByRole("alert").textContent).toBe("blog.read.missing");
  const refetch = vi.fn();
  reading.query = { isError: true, error: { status: 503 }, refetch };
  view.rerender(<BlogPostDetailView postId="article" />);
  expect(screen.getByRole("alert").textContent).toBe("blog.read.error");
  fireEvent.click(screen.getByRole("button", { name: "blog.read.retry" }));
  expect(refetch).toHaveBeenCalledOnce();
});
it("keeps category posts and their archive link when a background refresh fails", () => {
  const data = {
    data: [english as BlogArticleDto],
    pagination: { totalItems: 1, totalPages: 1, hasNextPage: false },
  };
  reading.categoryQuery = { data };
  const section = () => <BlogPostsCategorySection tag="news" title="News" />;
  const view = render(section(), {
    wrapper: ({ children }) => (
      <UIProvider
        hooks={{
          useRouter: () => ({
            pathname: "/blog",
            query: new URLSearchParams(),
            back: () => {},
            push: async () => {},
          }),
        }}
        presenters={{
          Link: ({ href, children }) => <a href={href}>{children}</a>,
        }}
      >
        {children}
      </UIProvider>
    ),
  });
  expect(screen.getByText(english.title)).toBeTruthy();

  reading.categoryQuery = { data, isError: true };
  view.rerender(section());
  expect(screen.getByText(english.title)).toBeTruthy();
  expect(
    screen
      .getByRole("link", { name: "blog.buttons.seeMore" })
      .getAttribute("href"),
  ).toBe("/blog/archive?tag=news");

  reading.categoryQuery = { isError: true };
  view.rerender(section());
  expect(screen.queryByText("News")).toBeNull();
});
it.each([
  {
    post: english as BlogArticleDto,
    locale: "pt-BR",
    label: "Português (Brasil)",
    menu: false,
  },
  { post: multilingual, locale: "ja", label: "日本語", menu: true },
])(
  "changes mobile language to $locale on the current article",
  ({ post, locale, label, menu }) => {
    render(
      <UIProvider
        presenters={{ BlogArticleLanguageLink: MobileBlogArticleLanguageLink }}
        hooks={{
          useRouter: () => ({
            pathname: "/blog/post",
            query: new URLSearchParams(),
            back: () => {},
            push: async () => {},
          }),
        }}
      >
        <BlogArticleView post={post} />
      </UIProvider>,
    );
    if (menu) {
      fireEvent.click(
        screen.getByRole("button", { name: "blog.read.chooseLanguage" }),
      );
    }
    fireEvent.click(
      screen.getByRole(menu ? "menuitem" : "button", { name: label }),
    );
    expect(reading.setLanguage).toHaveBeenCalledWith(locale);
  },
);
