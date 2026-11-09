import type { Accept } from "react-dropzone";

/**
 * Video formats accepted by the profile video endpoint. Matroska files often
 * reach the browser without a MIME type, so the empty MIME key maps the
 * extension check instead.
 */
export const PROFILE_VIDEO_ACCEPT: Accept = {
  "video/mp4": [".mp4", ".m4v"],
  "video/quicktime": [".mov"],
  "video/webm": [".webm"],
  "video/x-matroska": [".mkv"],
  "": [".mkv"],
};

/** 64 MiB, the server-side limit for a profile video upload. */
export const PROFILE_VIDEO_MAX_SIZE = 64 * 1024 ** 2;

/** Avatars only accept static images; GIF uploads are rejected server-side. */
export const PROFILE_AVATAR_IMAGE_ACCEPT: Accept = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

/**
 * Banners keep every image format the shared canvas re-encodes to JPEG, except
 * GIF, which is no longer accepted for profile images.
 */
export const PROFILE_BANNER_IMAGE_ACCEPT: Accept = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/svg+xml": [".svg"],
  "image/webp": [".webp"],
  "image/avif": [".avif"],
  "image/heic": [".heic"],
  "image/heif": [".heif"],
};
