// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { createAuthClient } from "better-auth/react";
import { getAuthClientOptions } from "../../../../../packages/ui/src/components/auth/authClient";
import { signedQuery } from "./testUtils";

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

it("registers the pinned OAuth plugin beside admin and injects the provider-filtered signed query", async () => {
  const query = signedQuery();
  const original = query.toString();
  query.append("error", "access_denied");
  window.history.replaceState({}, "", `/auth?${query}`);
  const fetch = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        url: "https://social.example/login",
        redirect: false,
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    ),
  );
  vi.stubGlobal("fetch", fetch);
  const options = getAuthClientOptions("https://api.example");
  expect(options.plugins.map((plugin) => plugin.id)).toEqual([
    "admin-client",
    "oauth-provider-client",
  ]);
  const client = createAuthClient(options);
  await client.signIn.social({
    provider: "google",
    callbackURL: "https://gamenode.app/auth",
  });
  expect(JSON.parse(fetch.mock.calls[0][1].body).oauth_query).toBe(original);
  expect(typeof client.admin.banUser).toBe("function");
});
