import { afterEach, expect, it, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { BlogPostService } from "@repo/wrapper/server";
import { english, portuguese, fallback } from "./fixtures";
const selected = vi.hoisted(() => ({ post: undefined as any }));
vi.mock("@mantine/core", () => ({
  Stack: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
}));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@repo/ui", async () => ({
  ...(await import(
    "../../../../../packages/ui/src/components/blog/hooks/queryOptions"
  )),
  useBlogPost: () => ({ data: selected.post }),
  BlogPostDetailLayout: () => null,
  BlogPostDetailView: () => null,
  BlogPostsLayout: () => null,
}));
vi.mock("next/head", () => ({
  default: ({ children }: any) => <>{children}</>,
}));
vi.mock("next/router", () => ({
  useRouter: () => ({ query: { postId: "article" } }),
}));
import Page, {
  getServerSideProps,
} from "../../../../web/src/pages/blog/post/[postId]/index";
afterEach(() => {
  vi.restoreAllMocks();
});
it("prefetches the route locale with published data for hydration", async () => {
  const one = vi
    .spyOn(BlogPostService, "blogPostControllerOneV1")
    .mockResolvedValue(portuguese as any);
  const result = await getServerSideProps({
    params: { postId: english.id },
    locale: "pt-BR",
    res: {},
  } as any);
  expect(one).toHaveBeenCalledWith(english.id, "pt-BR");
  expect(result.props?.dehydratedState?.queries[0].state.data).toEqual(
    portuguese,
  );
});
it.each([404, 503])(
  "returns the real HTTP state for API %i",
  async (status) => {
    vi.spyOn(BlogPostService, "blogPostControllerOneV1").mockRejectedValue({
      status,
    });
    const res = { statusCode: 200 };
    const result = await getServerSideProps({
      params: { postId: english.id },
      locale: "en",
      res,
    } as any);
    if (status === 404) expect(result).toEqual({ notFound: true });
    else {
      expect(res.statusCode).toBe(503);
      expect(result).toEqual({ props: { unavailable: true } });
    }
  },
);

it("renders localized metadata and published-only alternates without JavaScript", () => {
  process.env.NEXT_PUBLIC_DOMAIN_WEBSITE = "https://gamenode.app";
  selected.post = portuguese;
  let html = renderToString(<Page />);
  expect(html).toContain(portuguese.excerpt);
  expect(html).toContain(
    'rel="canonical" href="https://gamenode.app/pt-BR/blog/post/article"',
  );
  expect(html).toContain('hrefLang="pt-BR"');
  selected.post = fallback;
  html = renderToString(<Page />);
  expect(html).toContain(
    'rel="canonical" href="https://gamenode.app/blog/post/article"',
  );
  expect(html).not.toContain('hrefLang="pt-BR"');
});
