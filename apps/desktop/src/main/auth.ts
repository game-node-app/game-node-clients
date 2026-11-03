import { safeStorage, shell } from "electron";
import { readFile, writeFile, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { PROVIDERS, type Provider, type SessionChange } from "../shared/bridge";
import { parseAuthLink } from "./authLink";

export class DesktopAuth {
  private token?: string;
  private callback?: string;
  private file: string;
  private mutation: Promise<void> = Promise.resolve();
  constructor(
    private server: string,
    userData: string,
    private changed: (session: SessionChange) => void,
  ) {
    this.file = join(userData, "session.enc");
  }
  async load() {
    if (
      process.platform === "linux" &&
      safeStorage.getSelectedStorageBackend() === "basic_text"
    )
      console.warn(
        "Session storage uses basic_text: no OS keyring is available.",
      );
    try {
      this.token = (
        await safeStorage.decryptStringAsync(await readFile(this.file))
      ).result;
    } catch (error) {
      if ((error as { code?: string }).code !== "ENOENT")
        console.warn("Could not restore encrypted session.");
    }
  }
  getToken() {
    return this.token;
  }
  async signIn(provider: Provider) {
    if (!PROVIDERS.includes(provider))
      throw new Error("Unknown sign-in provider");
    const callback = `app.gamenode://desktop/auth/${randomUUID()}`;
    this.callback = callback;
    const response = await fetch(
      new URL("/v1/auth/sign-in/social", this.server),
      {
        method: "POST",
        signal: AbortSignal.timeout(30000),
        headers: {
          "content-type": "application/json",
          "capacitor-origin": "app.gamenode://",
          "x-skip-oauth-proxy": "true",
        },
        body: JSON.stringify({
          provider,
          callbackURL: callback,
          newUserCallbackURL: callback,
          errorCallbackURL: callback,
        }),
      },
    );
    if (!response.ok) throw new Error("Could not start sign-in");
    const data = await response.json();
    if (typeof data.url !== "string" || new URL(data.url).protocol !== "https:")
      throw new Error("Invalid provider URL");
    // Match better-auth-capacitor: the browser proxy installs the OAuth state cookie before redirecting.
    const proxy = new URL(
      "/v1/auth/capacitor-authorization-proxy",
      this.server,
    );
    proxy.searchParams.set("authorizationURL", data.url);
    const stateCookie = response.headers
      .getSetCookie()
      .find((c) => /(?:^|\s)(?:__Secure-)?better-auth\.oauth_state=/.test(c));
    if (stateCookie)
      proxy.searchParams.set(
        "oauthState",
        stateCookie.split(";")[0].split("=").slice(1).join("="),
      );
    await shell.openExternal(proxy.href);
  }
  async acceptLink(value: string) {
    const result = parseAuthLink(value, this.callback);
    if (!result) return;
    this.callback = undefined;
    if ("error" in result) {
      this.changed({ signedIn: !!this.token, error: result.error });
      return;
    }
    this.mutation = this.mutation
      .catch(() => {})
      .then(async () => {
        const encrypted = await safeStorage.encryptStringAsync(result.token);
        await writeFile(this.file + ".tmp", encrypted, { mode: 0o600 });
        await rename(this.file + ".tmp", this.file);
        this.token = result.token;
        this.changed({ signedIn: true });
      });
    await this.mutation;
  }
  async signOut() {
    this.callback = undefined;
    // Serialize deletion after an in-flight callback so sign-out cannot resurrect a session.
    this.mutation = this.mutation
      .catch(() => {})
      .then(async () => {
        await rm(this.file, { force: true });
        const token = this.token;
        this.token = undefined;
        this.changed({ signedIn: false });
        if (token)
          void fetch(new URL("/v1/auth/sign-out", this.server), {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "content-type": "application/json",
            },
            body: "{}",
          }).catch(() =>
            console.warn(
              "Could not revoke remote session; local session was cleared.",
            ),
          );
      });
    await this.mutation;
  }
}
