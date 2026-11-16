const PREMIUM_IMAGE_PATH = "/img/premium";

/**
 * Resolves a file under `apps/web/public/img/premium` (assets exported from
 * the Figma "Premium · LP" section), e.g. `premiumAsset("28111.png")`.
 */
const premiumAsset = (file: string) =>
  `${PREMIUM_IMAGE_PATH}/${file.replace(/^\/+/, "")}`;

export { premiumAsset };
