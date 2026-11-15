/**
 * Native export sizes of the recap card, in pixels. Templates lay themselves
 * out in these units, so the exported image never depends on the screen.
 */
export const RECAP_CARD_FORMATS = {
  story: { width: 1080, height: 1920 },
  feed: { width: 1600, height: 900 },
} as const;

export type RecapCardFormat = keyof typeof RECAP_CARD_FORMATS;

/** Tallest the preview gets, so a Story card does not push the options off screen. */
export const RECAP_PREVIEW_MAX_HEIGHT = 720;

/**
 * Scale that fits the native card in the preview container: never above 1,
 * never wider than the container and never taller than the preview limit.
 * Until the container is measured the card is not scaled.
 */
export function getRecapPreviewScale(
  containerWidth: number,
  format: RecapCardFormat,
  maxHeight: number = RECAP_PREVIEW_MAX_HEIGHT,
): number {
  const size = RECAP_CARD_FORMATS[format];
  if (!(containerWidth > 0)) return 1;

  return Math.min(1, containerWidth / size.width, maxHeight / size.height);
}
