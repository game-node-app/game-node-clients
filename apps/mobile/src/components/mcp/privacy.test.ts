// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  beforeOAuthCapture,
  isPrivateAuthUrl,
  protectOAuthPage,
} from "../../../../../packages/analytics/src/oauthPrivacy";
const mocks = vi.hoisted(() => ({ config: vi.fn(), stop: vi.fn() }));
vi.mock("posthog-js", () => ({
  default: { set_config: mocks.config, stopSessionRecording: mocks.stop },
}));
describe("OAuth telemetry boundary", () => {
  it.each([
    "/auth?sig=secret",
    "/pt-BR/oauth/consent?state=secret",
    "/home?oauth_query=secret",
    "/auth?error=failed",
  ])("drops initial/SPA captures for %s", (url) => {
    expect(isPrivateAuthUrl(url)).toBe(true);
    expect(
      beforeOAuthCapture({
        event: "$pageview",
        properties: { $current_url: `https://gamenode.app${url}` },
      } as never),
    ).toBeNull();
    protectOAuthPage(url);
    expect(mocks.config).toHaveBeenLastCalledWith({
      autocapture: false,
      disable_session_recording: true,
    });
    expect(mocks.stop).toHaveBeenCalled();
  });
  it("scrubs sensitive referrers and nested URLs on later ordinary pages", () => {
    const event = {
      event: "$pageview",
      properties: {
        $current_url: "https://gamenode.app/game/12",
        $referrer: "https://gamenode.app/auth?sig=secret&resource=a&resource=b",
        nested: { href: "/oauth/consent?sig=secret" },
        access_token: "secret",
      },
    };
    const result = beforeOAuthCapture(event as never);
    expect(JSON.stringify(result)).not.toContain("secret");
    expect(result?.properties.$current_url).toBe(event.properties.$current_url);
    expect(
      beforeOAuthCapture({
        event: "$pageview",
        properties: { $current_url: "/game/12", $referrer: "/home" },
      } as never)?.properties.$referrer,
    ).toBe("/home");
    protectOAuthPage("/game/12");
    expect(mocks.config).toHaveBeenLastCalledWith({
      autocapture: true,
      disable_session_recording: false,
    });
  });
});
