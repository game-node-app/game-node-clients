const ABOUT_IMAGE_PATH = "/img/about";
const LANDING_IMAGE_PATH = "/img/landing";

const resolveAsset = (basePath: string, file: string) =>
  `${basePath}/${file.replace(/^\/+/, "")}`;

/**
 * Resolves a file under `apps/web/public/img/about`.
 * Pass the descriptive name delivered by the design, including its extension
 * (for example `aboutAsset("cover-hades.png")`); nested folders are supported.
 */
const aboutAsset = (file: string) => resolveAsset(ABOUT_IMAGE_PATH, file);

/** Resolves a file under `apps/web/public/img/landing`. */
const landingAsset = (file: string) => resolveAsset(LANDING_IMAGE_PATH, file);

/** Landing assets reused by the About page. */
const LANDING_ASSETS = {
  logo: landingAsset("41a07.svg"),
  wordmark: landingAsset("wordmark.svg"),
  checkIcon: landingAsset("icon-check-brand.svg"),
} as const;

/**
 * Platform icons already available in the landing asset set. The Nintendo icon
 * is not there; the About asset set will provide it.
 */
const PLATFORM_ICONS = {
  steam: landingAsset("780e4.svg"),
  playstation: landingAsset("1255f.svg"),
  xbox: landingAsset("24331.svg"),
  epicGames: landingAsset("317b0.svg"),
  gog: landingAsset("b5a83.svg"),
} as const;

export { aboutAsset, landingAsset, LANDING_ASSETS, PLATFORM_ICONS };
