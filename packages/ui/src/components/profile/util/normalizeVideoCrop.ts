/**
 * Crop values as reported by `react-easy-crop`'s `onCropComplete`
 * (`croppedAreaPercentages`), all in the `0..100` range.
 */
export type VideoCropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Crop values normalized to `0..1`, as expected by `PUT /v1/profile/video`.
 */
export type NormalizedVideoCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const DECIMALS = 6;
const MULTIPLIER = 10 ** DECIMALS;
/** Smallest accepted size, so width and height are always greater than 0. */
const MIN_SIZE = 1 / MULTIPLIER;

const round = (value: number) => Math.round(value * MULTIPLIER) / MULTIPLIER;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const toUnit = (percentage: number) =>
  Number.isFinite(percentage) ? clamp(percentage / 100, 0, 1) : 0;

/**
 * Converts a percentage crop into normalized `0..1` values.
 *
 * Width and height are rounded first, then the origins are clamped against
 * `1 - size`, so rounding can never push `x + width` or `y + height` above 1
 * (the far-edge case the server validates). Values are also clamped into
 * `0..1` to survive a malformed crop from the cropper.
 */
export function normalizeVideoCrop(crop: VideoCropArea): NormalizedVideoCrop {
  const width = clamp(round(toUnit(crop.width)), MIN_SIZE, 1);
  const height = clamp(round(toUnit(crop.height)), MIN_SIZE, 1);
  const x = clamp(round(toUnit(crop.x)), 0, round(1 - width));
  const y = clamp(round(toUnit(crop.y)), 0, round(1 - height));

  return { x, y, width, height };
}
