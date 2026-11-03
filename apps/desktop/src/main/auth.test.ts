import { afterEach, beforeEach, it, expect, vi } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

vi.mock("electron", () => ({
  safeStorage: {
    encryptStringAsync: async (token: string) =>
      Buffer.from("encrypted:" + token),
    decryptStringAsync: async (data: Buffer) => ({
      result: data.toString().slice(10),
    }),
    getSelectedStorageBackend: () => "gnome_libsecret",
  },
  shell: { openExternal: vi.fn() },
}));
import { shell } from "electron";
import { DesktopAuth } from "./auth";

let directory: string;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "gamenode-auth-test-"));
});
afterEach(async () => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  await rm(directory, { recursive: true, force: true });
});
it("uses the native proxy, persists a callback token, restores it and deletes it on sign-out", async () => {
  const fetcher = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        url: "https://accounts.google.com/oauth?state=state",
      }),
      {
        headers: {
          "set-cookie": "better-auth.oauth_state=state-cookie; Path=/",
        },
      },
    ),
  );
  vi.stubGlobal("fetch", fetcher);
  const changed = vi.fn();
  const auth = new DesktopAuth("https://server.test", directory, changed);
  await auth.load();
  expect(auth.getToken()).toBeUndefined();
  await auth.signIn("google");
  const request = JSON.parse(fetcher.mock.calls[0][1].body);
  expect(fetcher.mock.calls[0][1].headers["capacitor-origin"]).toBe(
    "app.gamenode://",
  );
  expect(request.callbackURL).toMatch(/^app\.gamenode:\/\/desktop\/auth\//);
  const proxy = new URL(vi.mocked(shell.openExternal).mock.calls[0][0]);
  expect(proxy.pathname).toBe("/v1/auth/capacitor-authorization-proxy");
  expect(proxy.searchParams.get("oauthState")).toBe("state-cookie");
  await auth.acceptLink(
    `${request.callbackURL}?cookie=${encodeURIComponent("better-auth.session_token=token.signature; Path=/")}`,
  );
  expect(auth.getToken()).toBe("token.signature");
  expect(changed).toHaveBeenCalledWith({ signedIn: true });
  expect((await readFile(join(directory, "session.enc"))).toString()).not.toBe(
    "token.signature",
  );
  const restored = new DesktopAuth("https://server.test", directory, changed);
  await restored.load();
  expect(restored.getToken()).toBe("token.signature");
  await restored.signOut();
  expect(restored.getToken()).toBeUndefined();
  await expect(readFile(join(directory, "session.enc"))).rejects.toMatchObject({
    code: "ENOENT",
  });
  expect(changed).toHaveBeenLastCalledWith({ signedIn: false });
});
it("ignores callbacks after sign-out and rejects unknown providers", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ url: "https://accounts.google.com/oauth" }),
        ),
      ),
  );
  const auth = new DesktopAuth("https://server.test", directory, vi.fn());
  await auth.signIn("google");
  await auth.signOut();
  await auth.acceptLink(
    "app.gamenode://desktop/auth/forged?cookie=better-auth.session_token=forged",
  );
  expect(auth.getToken()).toBeUndefined();
  // @ts-expect-error IPC receives untrusted input at runtime.
  await expect(auth.signIn("unknown")).rejects.toThrow("Unknown");
});
it("finishes sign-out after an in-flight token write", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      new Response(
        JSON.stringify({ url: "https://accounts.google.com/oauth" }),
      ),
    );
  vi.stubGlobal("fetch", fetcher);
  const auth = new DesktopAuth("https://server.test", directory, vi.fn());
  await auth.signIn("google");
  const callback = JSON.parse(fetcher.mock.calls[0][1].body).callbackURL;
  const accepting = auth.acceptLink(
    `${callback}?cookie=better-auth.session_token=token.signature`,
  );
  const leaving = auth.signOut();
  await Promise.all([accepting, leaving]);
  expect(auth.getToken()).toBeUndefined();
  await expect(readFile(join(directory, "session.enc"))).rejects.toMatchObject({
    code: "ENOENT",
  });
});
