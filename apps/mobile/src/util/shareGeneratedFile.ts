import { blobToBase64 } from "@/util/imageUtils.ts";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import type { ShareFilePayload } from "@repo/ui";

/**
 * Writes a generated image to the app cache and hands its `file://` URL to the
 * native share sheet.
 *
 * Capacitor needs a real file path, unlike the Web Share API which takes the
 * `File` itself — that difference is the only reason web and mobile don't use
 * the exact same share call. The copy text is left out on purpose: the card
 * already carries the game info, and some apps drop the image when a share has
 * both text and a file.
 */
export async function shareGeneratedFile({
  file,
  title,
}: ShareFilePayload): Promise<boolean> {
  const base64 = await blobToBase64(file);

  const cachedFile = await Filesystem.writeFile({
    path: file.name,
    data: base64,
    directory: Directory.Cache,
  });

  try {
    await Share.share({
      title,
      url: cachedFile.uri,
      dialogTitle: title,
    });
    return true;
  } catch (error) {
    // the plugin rejects when the share sheet is dismissed
    if (/cancel/i.test((error as Error).message ?? "")) return false;
    throw error;
  }
}
