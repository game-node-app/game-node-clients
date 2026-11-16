/** The templates a photo or clip can be the background of. */
export type RecapMediaTemplate = "poster" | "dash" | "bento" | "summary";

export interface RecapMediaRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

/**
 * Area of each template that its background media (a photo or a clip) fills,
 * in card pixels. It is where the blurred cover art is drawn when there is no
 * media, and where the video export draws the clip, so the card and the
 * encoder share one definition.
 */
export const RECAP_MEDIA_RECTS: Record<RecapMediaTemplate, RecapMediaRect> = {
  poster: { x: 0, y: 0, width: 1080, height: 1300, radius: 0 },
  dash: { x: 0, y: 0, width: 1080, height: 1250, radius: 0 },
  // The top game tile of the bento grid.
  bento: { x: 48, y: 155, width: 984, height: 620, radius: 40 },
  summary: { x: 0, y: 0, width: 1600, height: 900, radius: 0 },
};

/**
 * Whether the media fades into the card's ground at the bottom (the ones that
 * hang from the top of the card) or is darkened evenly (a tile or the whole
 * card).
 */
export const RECAP_MEDIA_FADES: Record<RecapMediaTemplate, boolean> = {
  poster: true,
  dash: true,
  bento: false,
  summary: false,
};
