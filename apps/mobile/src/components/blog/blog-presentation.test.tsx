// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { BlogArticleView } from "../../../../../packages/ui/src/components/blog/view/BlogArticleView";
import { draft, english, fallback } from "./fixtures";
const reading = vi.hoisted(() => ({
  query: {} as {
    data?: import("@repo/wrapper/server").BlogArticleDto;
    isLoading?: boolean;
    isError?: boolean;
    error?: { status: number };
    refetch?: () => void;
  },
  setLanguage: vi.fn(),
}));
const lightbox = vi.hoisted(() => ({
  openLightbox: vi.fn(),
  registerImage: vi.fn(),
  unregisterImage: vi.fn(),
}));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useI18nContext: () => ({ setLanguage: reading.setLanguage }),
}));
vi.mock("@mantine/core", () => {
  const C = ({ children, ...props }: import("react").ComponentProps<"div">) => (
    <div {...props}>{children}</div>
  );
  return {
    Box: C,
    Group: C,
    Stack: C,
    Text: C,
    Title: C,
    Badge: C,
    Button: ({
      children,
      onClick,
    }: import("react").ComponentProps<"button">) => (
      <button onClick={onClick}>{children}</button>
    ),
    Image: (props: import("react").ComponentProps<"img">) => <img {...props} />,
  };
});
vi.mock("../../../../../packages/ui/src/components", () => ({
  useBlogPost: () => reading.query,
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
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
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
it("shows fallback with only published language links and the resolved language", () => {
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
  expect(screen.queryByRole("link", { name: "pt-BR" })).toBeNull();
  expect(
    screen.getByRole("link", { name: "en" }).getAttribute("href"),
  ).toContain(`/blog/post/${english.id}`);
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
});

import { BlogPostDetailView } from "../../../../../packages/ui/src/components/blog/view/BlogPostDetailView";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";
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
it("changes mobile language on the current UUID article", () => {
  setProjectContext({
    client: "mobile",
    s3BucketUrl: "",
    serverUrl: "",
    searchUrl: "",
  });
  render(
    <BlogArticleView
      post={
        english as unknown as
          | import("@repo/wrapper/server").BlogArticleDto
          | import("@repo/wrapper/server").BlogPreviewDto
      }
    />,
  );
  fireEvent.click(screen.getByRole("link", { name: "pt-BR" }));
  expect(reading.setLanguage).toHaveBeenCalledWith("pt-BR");
});
