import process from "node:process";
import { BlogPostService, type BlogArticleDto } from "@repo/wrapper/server";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { getServerSideProps as getBlogHomeProps } from "../../../../web/src/pages/blog/index";
import Page, {
  getServerSideProps,
} from "../../../../web/src/pages/blog/post/[postId]/index";
import { english, fallback, portuguese } from "./fixtures";
const selected = vi.hoisted(() => ({
  post: undefined as import("@repo/wrapper/server").BlogArticleDto | undefined,
}));
vi.mock("@mantine/core", () => ({
  Stack: ({ children }: import("react").PropsWithChildren) => (
    <div>{children}</div>
  ),
  Text: ({ children }: import("react").PropsWithChildren) => (
    <span>{children}</span>
  ),
}));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@repo/ui", async () => ({
  ...(await import("../../../../../packages/ui/src/components/blog/constants")),
  ...(await import(
    "../../../../../packages/ui/src/components/blog/hooks/queryOptions"
  )),
  useBlogPost: () => ({ data: selected.post }),
  BlogPostDetailLayout: () => null,
  BlogPostDetailView: () => null,
  BlogPostsLayout: () => null,
}));
vi.mock("next/head", () => ({
  default: ({ children }: import("react").PropsWithChildren) => <>{children}</>,
}));
vi.mock("next/router", () => ({
  useRouter: () => ({
    asPath: "/blog/post/article",
    query: { postId: "article" },
  }),
}));
afterEach(() => {
  vi.restoreAllMocks();
});

it("hydrates the featured posts and each published category on the blog home", async () => {
  const tag = { id: "interviews", name: "Entrevistas", articles: [] };
  const data = [{ ...portuguese, tags: [tag] } as BlogArticleDto];
  vi.spyOn(BlogPostService, "blogPostControllerTagsV1").mockResolvedValue([
    tag,
  ]);
  const list = vi
    .spyOn(BlogPostService, "blogPostControllerListV1")
    .mockResolvedValue({
      data,
      pagination: { totalItems: 1, totalPages: 1, hasNextPage: false },
    });
  const { props } = await getBlogHomeProps({
    locale: "pt-BR",
  } as import("next").GetServerSidePropsContext);

  expect(list.mock.calls).toEqual([
    ["pt-BR", undefined, 3, undefined],
    ["pt-BR", tag.id, 8, undefined],
  ]);
  expect(
    props.dehydratedState.queries.map(({ queryKey, state }) => [
      queryKey,
      state.data,
    ]),
  ).toEqual(
    expect.arrayContaining([
      [["blog", "tags", "pt-BR"], [tag]],
      [
        ["blog", "posts", "pt-BR", null, 3, null],
        expect.objectContaining({ data }),
      ],
      [
        ["blog", "posts", "pt-BR", tag.id, 8, null],
        expect.objectContaining({ data }),
      ],
    ]),
  );
});

it("keeps the featured posts in SSR when category discovery fails", async () => {
  vi.spyOn(BlogPostService, "blogPostControllerTagsV1").mockRejectedValue({
    status: 503,
  });
  const data = [english as BlogArticleDto];
  vi.spyOn(BlogPostService, "blogPostControllerListV1").mockResolvedValue({
    data,
    pagination: { totalItems: 1, totalPages: 1, hasNextPage: false },
  });
  const { props } = await getBlogHomeProps(
    {} as import("next").GetServerSidePropsContext,
  );
  expect(props.dehydratedState.queries).toMatchObject([
    {
      queryKey: ["blog", "posts", "en", null, 3, null],
      state: { data: { data } },
    },
  ]);
});

it("prefetches the route locale with published data for hydration", async () => {
  const one = vi
    .spyOn(BlogPostService, "blogPostControllerOneV1")
    .mockResolvedValue(
      portuguese as unknown as import("@repo/wrapper/server").BlogArticleDto,
    );
  const result = await getServerSideProps({
    params: { postId: english.id },
    locale: "pt-BR",
    res: {},
  } as unknown as import("next").GetServerSidePropsContext);
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
    } as unknown as import("next").GetServerSidePropsContext);
    if (status === 404) expect(result).toEqual({ notFound: true });
    else {
      expect(res.statusCode).toBe(503);
      expect(result).toEqual({ props: { unavailable: true } });
    }
  },
);

it("renders localized metadata and published-only alternates without JavaScript", () => {
  process.env.NEXT_PUBLIC_DOMAIN_WEBSITE = "https://gamenode.app";
  selected.post = portuguese as unknown as NonNullable<typeof selected.post>;
  let html = renderToString(<Page />);
  expect(html).toContain(portuguese.excerpt);
  expect(html).toContain(
    'rel="canonical" href="https://gamenode.app/pt-BR/blog/post/article"',
  );
  expect(html).toContain('hrefLang="pt-BR"');
  selected.post = fallback as unknown as NonNullable<typeof selected.post>;
  html = renderToString(<Page />);
  expect(html).toContain(
    'rel="canonical" href="https://gamenode.app/blog/post/article"',
  );
  expect(html).not.toContain('hrefLang="pt-BR"');
});
