import { describe, expect, it } from "vitest";
import { getAndroidAppUrl } from "../../../../web/src/components/general/getAndroidAppUrl";

const androidChrome = "Mozilla/5.0 (Linux; Android 10; K) Chrome/131.0.0.0";

describe("Android web app shortcut", () => {
  it("carries the localized page URL and the encoded Play Store fallback", () => {
    const url = new URL("https://gamenode.app/pt-BR/game/12?source=web#top");

    expect(getAndroidAppUrl(url, "/game/[id]", androidChrome)).toBe(
      "intent://gamenode.app/pt-BR/game/12?source=web#top#Intent;scheme=https;package=app.gamenode;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dapp.gamenode%26pcampaignid%3Dweb_share;end",
    );
  });

  it.each([
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) CriOS/131.0.0.0",
    "Mozilla/5.0 (X11; Linux x86_64) Chrome/131.0.0.0",
    "Mozilla/5.0 (Android 10; Mobile; rv:131.0) Firefox/131.0",
    "Mozilla/5.0 (Linux; Android 10; K; wv) Chrome/131.0.0.0",
  ])("hides the shortcut in %s", (userAgent) => {
    const url = new URL("https://gamenode.app/home");

    expect(getAndroidAppUrl(url, "/home", userAgent)).toBeUndefined();
  });

  it.each([
    ["https://preview.gamenode.app/home", "/home"],
    ["https://gamenode.app/oauth/consent", "/oauth/consent"],
    ["https://gamenode.app/home?settings=profile", "/home"],
    ["https://gamenode.app/activity/all", "/activity/all"],
  ])("hides the shortcut for %s", (href, page) => {
    expect(
      getAndroidAppUrl(new URL(href), page, androidChrome),
    ).toBeUndefined();
  });
});
