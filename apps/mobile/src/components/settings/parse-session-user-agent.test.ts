import { describe, expect, it } from "vitest";
import { parseSessionUserAgent } from "../../../../../packages/ui/src/components/settings/tabs/privacy/parseSessionUserAgent";

describe("parseSessionUserAgent", () => {
  it.each([
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      { kind: "desktop", isApp: false, browser: "Chrome", os: "Windows" },
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
      { kind: "desktop", isApp: false, browser: "Edge", os: "Windows" },
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      { kind: "mobile", isApp: false, browser: "Safari", os: "iPhone" },
    ],
    [
      "Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.0.0 Mobile Safari/537.36",
      { kind: "mobile", isApp: true, browser: undefined, os: "Android" },
    ],
    ["", { kind: "desktop", isApp: false, browser: undefined, os: undefined }],
  ])("%s", (userAgent, expected) => {
    expect(parseSessionUserAgent(userAgent)).toEqual(expected);
  });
});
