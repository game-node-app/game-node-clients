import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

/** Public origin of the website. Link previews need absolute URLs. */
const SITE_URL = (
  process.env.NEXT_PUBLIC_DOMAIN_WEBSITE ?? "https://gamenode.app"
).replace(/\/$/, "");

const SITE_NAME = "GameNode";
const DEFAULT_DESCRIPTION =
  "GameNode is the ideal platform to manage your game collection virtually.";

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

function shorten(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > MAX_DESCRIPTION_LENGTH
    ? `${clean.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`
    : clean;
}

type Props = {
  title: string;
  description?: string;
  /** Image of the page (e.g. a game's cover). Defaults to the GameNode banner. */
  imageUrl?: string;
};

/**
 * Title, description and link-preview tags (Open Graph and X/Twitter) of a
 * page. Every tag has a `key`, so the tags of a page replace the default ones
 * of `_app` instead of being added next to them.
 */
export const OpenGraph = ({ title, description, imageUrl }: Props) => {
  const { asPath } = useRouter();
  const pageUrl = `${SITE_URL}${asPath.split(/[?#]/)[0]}`;
  const text = shorten(description || DEFAULT_DESCRIPTION);
  const pageImage = imageUrl ? toAbsoluteUrl(imageUrl) : undefined;
  const image = pageImage ?? DEFAULT_IMAGE_URL;
  // The banner is wide; a cover is not, so it gets the small image card.
  const card = pageImage ? "summary" : "summary_large_image";

  return (
    <Head>
      <title>{title}</title>
      <meta key="description" name="description" content={text} />

      <meta key="og:type" property="og:type" content="website" />
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:url" property="og:url" content={pageUrl} />
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={text} />
      <meta key="og:image" property="og:image" content={image} />
      <meta key="og:image:alt" property="og:image:alt" content={title} />
      <meta key="og:image:type" property="og:image:type" content="image/jpeg" />

      <meta key="twitter:card" name="twitter:card" content={card} />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta
        key="twitter:description"
        name="twitter:description"
        content={text}
      />
      <meta key="twitter:image" name="twitter:image" content={image} />
      <meta key="twitter:image:alt" name="twitter:image:alt" content={title} />
    </Head>
  );
};
