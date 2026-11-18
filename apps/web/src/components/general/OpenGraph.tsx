import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "@repo/locales";
import {
  DEFAULT_SITE_LOCALE,
  localizedUrl,
  SITE_LOCALES,
  SITE_URL,
} from "../../util/seo";

const SITE_NAME = "GameNode";

/**
 * Default preview image: 1200x630 (1.91:1) and well under 300 KB, which is
 * what WhatsApp, X, Facebook and LinkedIn can all load. A bigger file or a
 * relative URL is shown by Discord but dropped by the others.
 */
const DEFAULT_IMAGE_URL = `${SITE_URL}/img/og_image.jpg`;

const MAX_DESCRIPTION_LENGTH = 200;

/** Crawlers do not resolve relative or protocol-relative URLs. */
export function toAbsoluteUrl(url: string): string | undefined {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  return /^https?:\/\//.test(url) ? url : undefined;
}

const IMAGE_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

/** MIME type from the file extension; undefined when it can't be told. */
function imageTypeOf(url: string): string | undefined {
  const extension = url.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
  return extension ? IMAGE_TYPES[extension] : undefined;
}

function shorten(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > MAX_DESCRIPTION_LENGTH
    ? `${clean.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`
    : clean;
}

/** JSON for a `<script>`: `<` is escaped so the data can't close the tag. */
function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

type Props = {
  title: string;
  description?: string | null;
  /** Image of the page (e.g. a game's cover). Defaults to the GameNode banner. */
  imageUrl?: string | null;
  /** Alt text of `imageUrl`; defaults to the title. */
  imageAlt?: string | null;
  /**
   * The image is landscape (about 1.91:1 or 16:9), like a blog cover, and is
   * shown as a large preview. Portrait images (game covers) get the small card.
   */
  wideImage?: boolean;
  /** `og:type`; "article" for blog posts, "profile" for user pages. */
  type?: "website" | "article" | "profile";
  /** ISO date of an article, for `article:published_time`. */
  publishedTime?: string;
  /**
   * Locales the page exists in. Defaults to every locale of the site. Each
   * gets an `hreflang` link.
   */
  locales?: readonly string[];
  /**
   * Locale of the content actually shown, when it differs from the requested
   * one (a blog post without a translation). Used for the canonical URL.
   */
  contentLocale?: string;
  /**
   * Adds the canonical and `hreflang` links. Off for the site-wide defaults of
   * `_app`: a page can replace keyed tags but not remove them, so a default
   * link would stay on pages that have none (`noIndex` ones) or link to a
   * locale the page doesn't exist in.
   */
  links?: boolean;
  /** Asks search engines not to index the page (private or user-only pages). */
  noIndex?: boolean;
  /** Structured data (schema.org) of the page. */
  jsonLd?: object | object[];
};

/**
 * Title, description, canonical/alternate links and link-preview tags (Open
 * Graph and X/Twitter) of a page. Every tag has a `key`, so the tags of a page
 * replace the default ones of `_app` instead of being added next to them.
 */
export const OpenGraph = ({
  title,
  description,
  imageUrl,
  imageAlt,
  wideImage = false,
  type = "website",
  publishedTime,
  locales = SITE_LOCALES,
  contentLocale,
  links = true,
  noIndex = false,
  jsonLd,
}: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  // Without the i18n prefix: Next.js strips the locale from `asPath`.
  const path = router.asPath.split(/[?#]/)[0] || "/";
  const locale = contentLocale ?? router.locale ?? DEFAULT_SITE_LOCALE;
  const pageUrl = localizedUrl(locale, path);
  // A statically optimized page renders its route pattern ("/game/[id]").
  const withLinks = links && !noIndex && !path.includes("[");
  const text = shorten(description || t("seo.defaultDescription"));
  const pageImage = imageUrl ? toAbsoluteUrl(imageUrl) : undefined;
  const image = pageImage ?? DEFAULT_IMAGE_URL;
  const alt = (pageImage && imageAlt) || title;
  const imageType = imageTypeOf(image);
  // The banner is wide; a game cover is not, so it gets the small image card.
  const card = !pageImage || wideImage ? "summary_large_image" : "summary";

  return (
    <Head>
      <title>{title}</title>
      <meta key="description" name="description" content={text} />
      {noIndex && <meta key="robots" name="robots" content="noindex, follow" />}
      {withLinks && <link key="canonical" rel="canonical" href={pageUrl} />}
      {withLinks &&
        locales.map((alternate) => (
          <link
            key={`hreflang-${alternate}`}
            rel="alternate"
            hrefLang={alternate}
            href={localizedUrl(alternate, path)}
          />
        ))}
      {withLinks && locales.includes(DEFAULT_SITE_LOCALE) && (
        <link
          key="hreflang-x-default"
          rel="alternate"
          hrefLang="x-default"
          href={localizedUrl(DEFAULT_SITE_LOCALE, path)}
        />
      )}

      <meta key="og:type" property="og:type" content={type} />
      {type === "article" && publishedTime && (
        <meta
          key="article:published_time"
          property="article:published_time"
          content={publishedTime}
        />
      )}
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta
        key="og:locale"
        property="og:locale"
        content={locale.replace("-", "_")}
      />
      <meta key="og:url" property="og:url" content={pageUrl} />
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={text} />
      <meta key="og:image" property="og:image" content={image} />
      <meta key="og:image:alt" property="og:image:alt" content={alt} />
      {imageType && (
        <meta
          key="og:image:type"
          property="og:image:type"
          content={imageType}
        />
      )}

      <meta key="twitter:card" name="twitter:card" content={card} />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta
        key="twitter:description"
        name="twitter:description"
        content={text}
      />
      <meta key="twitter:image" name="twitter:image" content={image} />
      <meta key="twitter:image:alt" name="twitter:image:alt" content={alt} />

      {jsonLd && (
        <script
          key="jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      )}
    </Head>
  );
};
