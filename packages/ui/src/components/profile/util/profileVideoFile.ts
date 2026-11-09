/**
 * Video extensions the profile video endpoint accepts. Matroska files often
 * reach the browser with an empty MIME type, so the extension is checked too.
 */
const PROFILE_VIDEO_EXTENSIONS = [".mp4", ".m4v", ".mov", ".webm", ".mkv"];

/**
 * Whether a selected file should go through the video crop/upload flow instead
 * of the canvas image crop. Only used client-side to branch the uploader; the
 * server remains authoritative about what it accepts.
 */
export function isProfileVideoFile(file: Pick<File, "name" | "type">): boolean {
  const name = (file.name ?? "").toLowerCase();

  return (
    file.type?.startsWith("video/") === true ||
    PROFILE_VIDEO_EXTENSIONS.some((extension) => name.endsWith(extension))
  );
}
