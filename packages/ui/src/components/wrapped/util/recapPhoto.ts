import { RECAP_COLORS } from "#@/components/wrapped/card/recapCardTheme";

/** Longest side of the stored photo, in pixels (the poster is 1080 wide). */
export const RECAP_PHOTO_MAX_SIDE = 2160;
const JPEG_QUALITY = 0.9;

/**
 * Reads a photo the user picked as a JPEG data URL, scaled down to
 * {@link RECAP_PHOTO_MAX_SIDE}. A data URL (instead of an object URL) is what
 * the image export can always embed, and the smaller file keeps it fast.
 * Rejects when the browser cannot decode the file.
 */
export async function loadRecapPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(
      1,
      RECAP_PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available.");

    // JPEG has no alpha: transparent PNGs sit on the card's ground color.
    ctx.fillStyle = RECAP_COLORS.ground;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
