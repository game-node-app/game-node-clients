import { getSizedImageUrl, ImageSize } from "@repo/ui";
import { Profile, ProfileService } from "@repo/wrapper/server";
import type { GetServerSidePropsContext } from "next";

/** Public origin of the website. Link previews and sitemaps need absolute URLs. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_DOMAIN_WEBSITE ?? "https://gamenode.app"
).replace(/\/$/, "");

export const SITE_LOCALES = ["en", "pt-BR"] as const;
export const DEFAULT_SITE_LOCALE = "en";

/** Absolute URL of `path` (starting with "/") in `locale`. */
export function localizedUrl(locale: string, path: string): string {
  const prefix = locale === DEFAULT_SITE_LOCALE ? "" : `/${locale}`;
  if (path === "/") return `${SITE_URL}${prefix || "/"}`;
  return `${SITE_URL}${prefix}${path}`;
}

/**
 * Link-preview images above this size are dropped by WhatsApp and LinkedIn,
 * so larger user uploads fall back to the default banner.
 */
const MAX_PREVIEW_IMAGE_BYTES = 300_000;
const PREVIEW_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Data of a profile that pages need for their title and link preview. */
export type SeoProfile = {
  userId: string;
  username: string;
  bio: string | null;
  imageUrl: string | null;
  /** The image is the (landscape) banner rather than the (square) avatar. */
  wideImage: boolean;
};

type StoredImage = Profile["avatar"] | Profile["banner"];

function previewImageUrl(image: StoredImage): string | null {
  if (
    !image ||
    image.size > MAX_PREVIEW_IMAGE_BYTES ||
    !PREVIEW_IMAGE_TYPES.includes(image.mimetype)
  ) {
    return null;
  }
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_URL;
  return bucket ? `${bucket}/${image.filename}.${image.extension}` : null;
}

export function toSeoProfile(profile: Profile): SeoProfile {
  const banner = previewImageUrl(profile.banner);
  const avatar = previewImageUrl(profile.avatar);
  return {
    userId: profile.userId,
    username: profile.username,
    bio: profile.bio || null,
    imageUrl: banner ?? avatar,
    wideImage: banner != undefined,
  };
}

/** Pages render without metadata rather than wait longer than this. */
const SEO_FETCH_TIMEOUT_MS = 3000;

/**
 * Runs a request made only for a page's metadata. Resolves to `null` when it
 * fails (private content, server error) or is slow, so the page still renders.
 */
export async function fetchForSeo<T>(request: () => Promise<T>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), SEO_FETCH_TIMEOUT_MS);
  });
  try {
    return await Promise.race([request(), timeout]);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The request failed because the resource doesn't exist. Some endpoints (game
 * repository) answer a missing entity with a 500 and TypeORM's
 * "Could not find any entity" message instead of a 404.
 */
export function isNotFoundError(error: unknown) {
  const apiError = error as {
    status?: number;
    body?: { message?: unknown };
  } | null;
  if (apiError?.status === 404) return true;
  const message = apiError?.body?.message;
  return (
    apiError?.status === 500 &&
    typeof message === "string" &&
    message.startsWith("Could not find any entity")
  );
}

/** Profile of `userId` for a page's metadata; `null` when it can't be fetched. */
export async function fetchSeoProfile(
  userId: string | string[] | undefined,
): Promise<SeoProfile | null> {
  if (typeof userId !== "string") return null;
  const profile = await fetchForSeo(() =>
    ProfileService.profileControllerFindOneByIdV1(userId),
  );
  return profile ? toSeoProfile(profile) : null;
}

/**
 * `getServerSideProps` of a page about a user: fetches the profile named by
 * the `param` route parameter for the page's title and link preview.
 */
export function getSeoProfileProps(param = "userId") {
  return async (ctx: GetServerSidePropsContext) => ({
    props: { seoProfile: await fetchSeoProfile(ctx.query[param]) },
  });
}

export type SeoProfileProps = { seoProfile: SeoProfile | null };

/** A large version of an IGDB game cover, or `null` when there is none. */
export function gameCoverUrl(url: string | undefined | null): string | null {
  const sized = getSizedImageUrl(url ?? undefined, ImageSize.FULL_HD);
  // getSizedImageUrl returns an error message for URLs it doesn't recognize.
  return sized?.startsWith("http") ? sized : null;
}

/** Text of user-written HTML (reviews), for a meta description. */
export function plainText(html: string | null | undefined): string {
  return (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
