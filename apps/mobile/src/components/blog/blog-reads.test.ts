import { afterEach, expect, it, vi } from "vitest";
import { dehydrate, hydrate, QueryClient } from "@tanstack/react-query";
import {
  blogPostOptions,
  blogPostsOptions,
  blogTagsOptions,
} from "../../../../../packages/ui/src/components/blog/hooks/queryOptions";
import { english, portuguese, fallback, unavailable } from "./fixtures";
afterEach(() => {
  vi.unstubAllGlobals();
});
it("isolates languages, filtered pages and SSR hydration using actual request serialization", async () => {
  const fetch = vi.fn(async (url: string) => {
    const u = new URL(url, "http://localhost");
    const row = u.searchParams.get("locale") === "pt-BR" ? portuguese : english;
    const body = u.pathname.endsWith("/tags")
      ? row.tags
      : u.pathname.endsWith(english.id)
        ? row
        : { data: [row], pagination: { totalItems: 1 } };
    return new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetch);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  expect(
    (await client.fetchQuery(blogPostOptions(english.id, "en"))).title,
  ).toBe(english.title);
  expect(
    (await client.fetchQuery(blogPostOptions(english.id, "pt-BR"))).title,
  ).toBe(portuguese.title);
  const browser = new QueryClient();
  hydrate(browser, dehydrate(client));
  expect(
    (await browser.fetchQuery(blogPostOptions(english.id, "pt-BR"))).content,
  ).toBe(portuguese.content);
  expect(fetch).toHaveBeenCalledTimes(2);
  await client.fetchQuery(
    blogPostsOptions({ tag: "review", limit: 10, offset: 20 }, "pt-BR"),
  );
  expect(fetch.mock.calls[2][0]).toContain(
    "locale=pt-BR&tag=review&limit=10&offset=20",
  );
  await client.fetchQuery(blogTagsOptions("pt-BR"));
  expect(fetch.mock.calls[3][0]).toContain("/tags?locale=pt-BR");
  client.clear();
  browser.clear();
});
it("preserves whole article fallback and permits a retry after upstream failure", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(unavailable), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(fallback), {
          headers: { "Content-Type": "application/json" },
        }),
      ),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const options = blogPostOptions(english.id, "pt-BR");
  await expect(client.fetchQuery(options)).rejects.toMatchObject({
    status: 503,
  });
  expect(await client.fetchQuery(options)).toEqual(fallback);
  client.clear();
});
it("keeps unfiltered list keys JSON-serializable for Next SSR props", () => {
  const { queryKey } = blogPostsOptions({ limit: 10 }, "en");
  expect(JSON.parse(JSON.stringify(queryKey))).toEqual(queryKey);
});
