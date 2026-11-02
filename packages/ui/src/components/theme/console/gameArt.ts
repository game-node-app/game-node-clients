import type { Game, GameArtwork } from "@repo/wrapper/server";
import { getSizedImageUrl, ImageSize } from "../../game/util/getSizedImageUrl";

type Image = Pick<GameArtwork, "url" | "width">;
type GameImages = Pick<Game, "artworks" | "screenshots">;

// IGDB sizes never upscale, so a small source image stays blurry as a full-screen backdrop
const SHARP_WIDTH = 1280;

// stable sort: on equal (or unknown) widths the earlier image wins
const widest = (images: Image[]) =>
  [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];

/** Wide art for backdrops and cards: the first sharp artwork, else the widest artwork or screenshot. */
export const getGameArtUrl = (game: GameImages, size: ImageSize) => {
  const artworks: Image[] = game.artworks ?? [];
  const sharp = artworks.find((art) => (art.width ?? 0) >= SHARP_WIDTH);
  return getSizedImageUrl(
    (sharp ?? widest([...artworks, ...(game.screenshots ?? [])]))?.url,
    size,
  );
};

/** In-game shot for cards: the widest screenshot, else the widest artwork. */
export const getGameScreenshotUrl = (game: GameImages, size: ImageSize) =>
  getSizedImageUrl(
    (widest(game.screenshots ?? []) ?? widest(game.artworks ?? []))?.url,
    size,
  );
