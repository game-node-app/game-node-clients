import { blobToBase64 } from "@/util/imageUtils.ts";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { downloadFile } from "@repo/ui";

/**
 * Saves a generated image. A native build has no browser download, so the file
 * goes to the documents folder and the caller is told (`true`) to confirm it;
 * on the web the usual `<a download>` runs and the browser announces it.
 */
export async function saveGeneratedFile(file: File): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    downloadFile(file);
    return false;
  }

  const base64 = await blobToBase64(file);
  await Filesystem.writeFile({
    path: file.name,
    data: base64,
    directory: Directory.Documents,
    recursive: true,
  });
  return true;
}
