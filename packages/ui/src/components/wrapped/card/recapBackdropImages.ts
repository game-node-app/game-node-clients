import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import type { RecapCustomization } from "#@/components/wrapped/card/recapCustomization";
import type { Game } from "@repo/wrapper/server";

export interface RecapBackdropImage {
  /** Image drawn as the backdrop. */
  url: string;
  /** Small version for the picker. */
  thumb: string;
  kind: "artwork" | "screenshot" | "cover";
}

/** `getSizedImageUrl` answers an error string for an unknown host: drop it. */
function sized(url: string | undefined, size: ImageSize): string | undefined {
  const result = getSizedImageUrl(url, size);
  return result?.startsWith("https://") ? result : undefined;
}

/**
 * The official images of a game the user can pick as the backdrop: its
 * artworks and screenshots (wide art), then the cover.
 */
export function getRecapBackdropImages(
  game: Game | undefined,
): RecapBackdropImage[] {
  if (!game) return [];

  const images: RecapBackdropImage[] = [];
  const add = (
    kind: RecapBackdropImage["kind"],
    source: string | undefined,
    size: ImageSize,
    thumbSize: ImageSize,
  ) => {
    const url = sized(source, size);
    const thumb = sized(source, thumbSize);
    if (url && thumb && !images.some((image) => image.url === url)) {
      images.push({ url, thumb, kind });
    }
  };

  for (const artwork of game.artworks ?? []) {
    add("artwork", artwork.url, ImageSize.FULL_HD, ImageSize.SCREENSHOT_MED);
  }
  for (const screenshot of game.screenshots ?? []) {
    add(
      "screenshot",
      screenshot.url,
      ImageSize.FULL_HD,
      ImageSize.SCREENSHOT_MED,
    );
  }
  add("cover", getCoverUrl(game), ImageSize.COVER_BIG_2X, ImageSize.COVER_BIG);

  return images;
}

/**
 * The image the user picked for `game`, when it is still one of its official
 * images; `undefined` keeps the automatic one.
 */
export function pickBackdropImage(
  game: Game | undefined,
  custom?: RecapCustomization,
): string | undefined {
  const url = custom?.backdropImageUrl;
  if (!url) return undefined;

  return getRecapBackdropImages(game).some((image) => image.url === url)
    ? url
    : undefined;
}
