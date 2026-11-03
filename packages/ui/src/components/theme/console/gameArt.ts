import type { Game, GameArtwork } from "@repo/wrapper/server";
import { getSizedImageUrl, ImageSize } from "../../game/util/getSizedImageUrl";

type Image = Pick<GameArtwork, "url" | "width" | "height">;
type GameImages = Pick<Game, "artworks" | "screenshots">;

// the 1080p box IGDB fits images into (never upscaling); backdrops cover a 16:9 area of that size
const BOX_WIDTH = 1920;
const BOX_HEIGHT = 1080;
// artworks are preferred over screenshots (key art, no HUD) while they stay this sharp
const ARTWORK_MIN_SHARPNESS = 0.9;

/**
 * How well an image covers a 16:9 backdrop once IGDB fits it into the 1080p box:
 * 1 is full resolution, 0.5 means it is stretched 2x. A wide panorama scores low on height.
 */
export const getSharpness = ({ width, height }: Image) => {
  if (!width || !height) return 0;
  const fit = Math.min(BOX_WIDTH / width, BOX_HEIGHT / height, 1);
  return Math.min((width * fit) / BOX_WIDTH, (height * fit) / BOX_HEIGHT);
};

// stable sort: on equal (or unknown) sharpness the earlier image wins
const sharpest = (images: Image[]) =>
  [...images].sort((a, b) => getSharpness(b) - getSharpness(a))[0];

// stable sort: on equal (or unknown) widths the earlier image wins
const widest = (images: Image[]) =>
  [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];

/** Wide art for backdrops and cards: the sharpest artwork if it is sharp enough, else the sharpest artwork or screenshot. */
export const getGameArtUrl = (game: GameImages, size: ImageSize) => {
  const artwork = sharpest(game.artworks ?? []);
  const image =
    artwork && getSharpness(artwork) >= ARTWORK_MIN_SHARPNESS
      ? artwork
      : sharpest([...(game.artworks ?? []), ...(game.screenshots ?? [])]);
  return getSizedImageUrl(image?.url, size);
};

/** In-game shot for cards: the widest screenshot, else the widest artwork. */
export const getGameScreenshotUrl = (game: GameImages, size: ImageSize) =>
  getSizedImageUrl(
    (widest(game.screenshots ?? []) ?? widest(game.artworks ?? []))?.url,
    size,
  );
