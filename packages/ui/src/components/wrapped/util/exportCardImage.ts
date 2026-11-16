import { loadRecapFonts } from "#@/components/wrapped/card/RecapCardFonts";
import {
  RECAP_CARD_FORMATS,
  type RecapCardFormat,
} from "#@/components/wrapped/card/recapCardFormats";
import { toBlob } from "html-to-image";

const EXTENSION_BY_TYPE = {
  "image/jpeg": "jpeg",
  "image/png": "png",
} as const;

export type RecapCardImageType = keyof typeof EXTENSION_BY_TYPE;

export interface ExportCardImageOptions {
  /** `image/jpeg` by default; the stories export a PNG. */
  type?: RecapCardImageType;
  /** JPEG quality, 0–1. Ignored for PNG. */
  quality?: number;
  /** File name prefix; a timestamp and the extension are appended. */
  filenamePrefix?: string;
}

/**
 * Renders `node` at the native size of `format` and returns the image as a
 * `File` ready to share or download. The node must already be laid out at that
 * native size (see `RecapCardPreview`), so the export never depends on the
 * screen or on the preview scale.
 */
export async function exportCardImage(
  node: HTMLElement,
  format: RecapCardFormat,
  options: ExportCardImageOptions = {},
): Promise<File> {
  const size = RECAP_CARD_FORMATS[format];
  const type = options.type ?? "image/jpeg";
  const quality = type === "image/jpeg" ? (options.quality ?? 0.92) : undefined;

  await loadRecapFonts();

  const blob = await toBlob(node, {
    width: size.width,
    height: size.height,
    pixelRatio: 1,
    type,
    ...(quality != null ? { quality } : {}),
    fetchRequestInit: {
      method: "GET",
      cache: "no-cache", // <-- Important!
    },
  });
  if (!blob) {
    throw new Error("Failed to generate final image.");
  }

  const prefix = options.filenamePrefix ?? "gamenode-recap";
  return new File(
    [blob],
    `${prefix}-${Date.now()}.${EXTENSION_BY_TYPE[type]}`,
    {
      type: blob.type,
    },
  );
}
