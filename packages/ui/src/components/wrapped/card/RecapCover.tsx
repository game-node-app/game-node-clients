import { useGameCoverImage } from "#@/components/game/hooks/useGameCoverImage";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import type { Game } from "@repo/wrapper/server";
import type { CSSProperties } from "react";

interface CoverProps {
  game: Game | undefined;
  width: number;
  height: number;
  radius?: number;
  style?: CSSProperties;
}

/** Cover width of `t_cover_big_2x`; larger boxes need the 1080p size. */
const COVER_BIG_2X_WIDTH = 528;
/** Covers are 3:4, so a tall box needs more width than its own width. */
const COVER_ASPECT_RATIO = 3 / 4;

export function getRecapCoverSize(width: number, height: number): ImageSize {
  const neededWidth = Math.max(width, height * COVER_ASPECT_RATIO);
  return neededWidth > COVER_BIG_2X_WIDTH
    ? ImageSize.FULL_HD
    : ImageSize.COVER_BIG_2X;
}

/**
 * Cover cropped to an exact box (`object-fit: cover`), so tall tiles are
 * filled with the art instead of letterboxed. Inert: it never navigates.
 */
export function RecapCover({
  game,
  width,
  height,
  radius = 16,
  style,
}: CoverProps) {
  const { src } = useGameCoverImage(game, getRecapCoverSize(width, height));

  return (
    <div
      className={"shrink-0 pointer-events-none overflow-hidden"}
      style={{
        width,
        height,
        borderRadius: radius,
        background: "#2A2622", // theme-exempt: recap card cover placeholder artwork
        ...style,
      }}
    >
      {src && (
        <img
          src={src}
          alt={game?.name ?? ""}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>
  );
}

/**
 * Wide art for atmosphere: the first artwork, then the first screenshot.
 * `undefined` when the game has neither, so callers can fall back to the cover.
 */
export function getRecapBackdropUrl(
  game: Game | undefined,
): string | undefined {
  const artwork = game?.artworks?.find((item) => item.url)?.url;
  const screenshot = game?.screenshots?.find((item) => item.url)?.url;
  const url = artwork ?? screenshot;
  return url ? getSizedImageUrl(url, ImageSize.FULL_HD) : undefined;
}

interface BackdropProps {
  game: Game | undefined;
  /** A specific image to draw instead of the game's automatic art. */
  imageUrl?: string;
  style?: CSSProperties;
}

/** Fills its parent with the game's wide art (or the cover as a fallback). */
export function RecapBackdrop({ game, imageUrl, style }: BackdropProps) {
  // The fallback cover fills a whole card, so it needs more than its tile size.
  const { src: coverSrc } = useGameCoverImage(game, ImageSize.FULL_HD);
  const src = imageUrl ?? getRecapBackdropUrl(game) ?? coverSrc;
  if (!src) return null;

  return (
    <img
      src={src}
      alt={""}
      className={"pointer-events-none"}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style,
      }}
    />
  );
}
