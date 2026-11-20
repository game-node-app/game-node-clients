import type { CSSProperties } from "react";

export const PROFILE_BANNER_DESKTOP_SIZE = { width: 1144, height: 400 };
export const PROFILE_BANNER_MOBILE_SIZE = { width: 358, height: 168 };

export const PROFILE_BANNER_DESKTOP_ASPECT =
  PROFILE_BANNER_DESKTOP_SIZE.width / PROFILE_BANNER_DESKTOP_SIZE.height;

/** Shared by the published profile and the upload previews. */
export const PROFILE_BANNER_IMAGE_STYLE: CSSProperties = {
  backgroundColor: "var(--gn-paper-0)",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center center",
};
