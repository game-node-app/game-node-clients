import { describe, it, expect } from "vitest";
import { join, resolve } from "node:path";
import { bundledPath, navigationPolicy, validWindowState } from "./security";
import { parseAuthLink } from "./authLink";

describe("navigation boundary", () => {
  it.each([
    ["app://gamenode/", "app"],
    ["https://gamenode.app", "external"],
    ["http://localhost:5000", "external"],
    ["file:///etc/passwd", "deny"],
    ["javascript:alert(1)", "deny"],
    ["app://evil/", "deny"],
    ["app.gamenode://home", "deny"],
    ["garbage", "deny"],
  ])("%s -> %s", (url, expected) =>
    expect(navigationPolicy(url)).toBe(expected),
  );
  it("allows only the exact dev origin and bundled paths", () => {
    const root = resolve("bundle");
    expect(
      navigationPolicy("http://localhost:5173/a", "http://localhost:5173"),
    ).toBe("app");
    expect(
      navigationPolicy("http://localhost:5174/a", "http://localhost:5173"),
    ).toBe("external");
    expect(bundledPath("app://gamenode/", root)).toBe(join(root, "index.html"));
    expect(bundledPath("app://gamenode/%2e%2e%2fsecret", root)).toBeUndefined();
    expect(bundledPath("app://evil/secret", root)).toBeUndefined();
  });
});
describe("window state", () => {
  const display = [{ x: 0, y: 0, width: 1920, height: 1080 }];
  it("restores visible bounds and rejects missing displays and invalid dimensions", () => {
    const saved = { x: 100, y: 100, width: 1000, height: 700, maximized: true };
    expect(validWindowState(saved, display)).toBe(true);
    expect(validWindowState({ ...saved, x: 3000 }, display)).toBe(false);
    expect(validWindowState({ ...saved, width: -1 }, display)).toBe(false);
    expect(validWindowState({ ...saved, y: NaN }, display)).toBe(false);
    expect(validWindowState({}, display)).toBe(false);
  });
});
describe("auth callback", () => {
  const callback = "app.gamenode://desktop/auth/nonce";
  it("extracts signed tokens including secure cookies", () => {
    const cookie =
      "__Secure-better-auth.session_token=abc%2Bsig; Path=/; HttpOnly";
    expect(
      parseAuthLink(
        callback + "?cookie=" + encodeURIComponent(cookie),
        callback,
      ),
    ).toEqual({ token: "abc+sig" });
  });
  it("reports errors and ignores unsolicited or malformed callbacks", () => {
    expect(parseAuthLink(callback + "?error=denied", callback)).toEqual({
      error: "denied",
    });
    expect(parseAuthLink(callback, callback)).toEqual({
      error: "Sign-in returned no session token",
    });
    expect(parseAuthLink("bad", callback)).toBeUndefined();
    expect(
      parseAuthLink(
        callback + "?cookie=other=x",
        "app.gamenode://desktop/auth/other",
      ),
    ).toBeUndefined();
    expect(parseAuthLink(callback)).toBeUndefined();
  });
});
