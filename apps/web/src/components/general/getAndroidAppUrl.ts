const ANDROID_PACKAGE = "app.gamenode";
const APP_LINK_ORIGIN = "https://gamenode.app";

export const GOOGLE_PLAY_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}&pcampaignid=web_share`;

// Web page patterns with an equivalent destination in the mobile router.
const APP_LINK_PAGES = new Set([
  "/achievements/[targetUserId]",
  "/activity/detail/[activityId]",
  "/awards/[year]",
  "/awards/[year]/nominations",
  "/awards/[year]/nominees/[userId]",
  "/awards/[year]/result",
  "/awards/[year]/vote",
  "/blog",
  "/blog/archive",
  "/blog/post/[postId]",
  "/daily",
  "/daily/[mode]",
  "/daily/[mode]/archive",
  "/daily/[mode]/practice",
  "/daily/ranking",
  "/daily/weekly",
  "/explore",
  "/feats/[targetUserId]",
  "/game/[id]",
  "/home",
  "/library",
  "/mcp",
  "/notifications",
  "/posts",
  "/profile/[userId]",
  "/profile/[userId]/reviews",
  "/profile/[userId]/stats",
  "/recap/[year]/[userId]",
  "/recap/[year]/[userId]/stories",
  "/wrapped",
]);

export function getAndroidAppUrl(url: URL, page: string, userAgent: string) {
  if (
    url.origin !== APP_LINK_ORIGIN ||
    !APP_LINK_PAGES.has(page) ||
    !/Android/i.test(userAgent) ||
    !/Chrome\//i.test(userAgent) ||
    /\bwv\b/i.test(userAgent)
  ) {
    return undefined;
  }

  // The app can open the Supporter settings from Home. Other settings are web modals.
  const settings = url.searchParams.get("settings");
  if (page === "/home" && settings != null && settings !== "premium") {
    return undefined;
  }

  const { host, pathname, search, hash } = url;
  return `intent://${host}${pathname}${search}${hash}#Intent;scheme=https;package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(GOOGLE_PLAY_URL)};end`;
}
