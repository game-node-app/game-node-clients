import { DAILY_MODES } from "@repo/ui";
import {
  AwardsService,
  BlogPostService,
  StatisticsRankingsRequestDto,
  StatisticsService,
} from "@repo/wrapper/server";
import { GetServerSidePropsContext } from "next";
import { fetchForSeo, localizedUrl, SITE_LOCALES } from "@/util/seo";

/**
 * `/sitemap.xml`: the public pages search engines should find, with their
 * `hreflang` alternates. Built on request and kept in memory for an hour.
 */

type SitemapEntry = {
  path: string;
  /** Locales the page exists in; every site locale by default. */
  locales?: readonly string[];
  lastModified?: string;
};

const CACHE_MS = 60 * 60 * 1000;
/** The rankings endpoint returns at most 100 items per request. */
const GAMES_PAGE_SIZE = 100;
const GAMES_PAGES = 10;

const STATIC_PATHS = [
  "/",
  "/about",
  "/premium",
  "/mcp",
  "/explore",
  "/blog",
  "/blog/archive",
  "/activity/all",
  "/daily",
  "/daily/ranking",
  "/daily/weekly",
  "/privacy",
  "/tos",
];

let cache: { xml: string; expiresAt: number } | undefined;

async function blogEntries(): Promise<SitemapEntry[]> {
  // Posts in either language: a post only in Portuguese isn't in the English list.
  const lists = await Promise.all(
    SITE_LOCALES.map((locale) =>
      fetchForSeo(() =>
        BlogPostService.blogPostControllerListV1(locale, undefined, 100, 0),
      ),
    ),
  );
  const posts = new Map<string, SitemapEntry>();
  for (const list of lists) {
    for (const post of list?.data ?? []) {
      posts.set(post.id, {
        path: `/blog/post/${post.id}`,
        locales: post.availableLocales,
        lastModified: post.publishedAt,
      });
    }
  }
  return [...posts.values()];
}

async function gameEntries(): Promise<SitemapEntry[]> {
  const pages = await Promise.all(
    Array.from({ length: GAMES_PAGES }, (_, page) =>
      fetchForSeo(() =>
        StatisticsService.statisticsControllerFindRankingsV1({
          sourceType: StatisticsRankingsRequestDto.sourceType.GAME,
          mode: StatisticsRankingsRequestDto.mode.POPULAR,
          period: StatisticsRankingsRequestDto.period.ALL,
          limit: GAMES_PAGE_SIZE,
          offset: page * GAMES_PAGE_SIZE,
        }),
      ),
    ),
  );
  const ids = new Set(
    pages.flatMap((page) => page?.items.map((item) => item.sourceId) ?? []),
  );
  return [...ids].map((id) => ({ path: `/game/${id}` }));
}

async function awardsEntries(): Promise<SitemapEntry[]> {
  const events = await fetchForSeo(() =>
    AwardsService.awardsControllerGetEventsV1(),
  );
  const now = Date.now();
  return (events ?? []).flatMap((event) =>
    new Date(event.resultsDate).getTime() <= now
      ? [{ path: `/awards/${event.year}/result` }]
      : [{ path: `/awards/${event.year}/nominations` }],
  );
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toXml(entries: SitemapEntry[]): string {
  // One <url> per locale, each listing every alternate (Google's format).
  const urls = entries.flatMap(
    ({ path, locales = SITE_LOCALES, lastModified }) => {
      const alternates = locales
        .map(
          (locale) =>
            `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(localizedUrl(locale, path))}"/>`,
        )
        .join("");
      const lastmod = lastModified
        ? `<lastmod>${escapeXml(new Date(lastModified).toISOString())}</lastmod>`
        : "";
      return locales.map(
        (locale) =>
          `<url><loc>${escapeXml(localizedUrl(locale, path))}</loc>${lastmod}${alternates}</url>`,
      );
    },
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
  ].join("\n");
}

/** A sitemap built while the server was failing is only kept briefly. */
const PARTIAL_CACHE_MS = 5 * 60 * 1000;

async function buildSitemap() {
  const [blog, games, awards] = await Promise.all([
    blogEntries(),
    gameEntries(),
    awardsEntries(),
  ]);
  const xml = toXml([
    ...STATIC_PATHS.map((path) => ({ path })),
    ...DAILY_MODES.map((mode) => ({ path: `/daily/${mode}` })),
    ...awards,
    ...blog,
    ...games,
  ]);
  return { xml, complete: blog.length > 0 && games.length > 0 };
}

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  if (!cache || cache.expiresAt < Date.now()) {
    const { xml, complete } = await buildSitemap();
    cache = {
      xml,
      expiresAt: Date.now() + (complete ? CACHE_MS : PARTIAL_CACHE_MS),
    };
  }
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
  );
  res.write(cache.xml);
  res.end();
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
