// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SessionAuth } from "../../../../../packages/ui/src/components/auth/SessionAuth";
import { getSafeRedirectPath } from "../../../../../packages/ui/src/components/auth/getSafeRedirectPath";
import {
  getAuthErrorKey,
  isLockedOutError,
} from "../../../../../packages/ui/src/components/auth/getAuthErrorKey";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

const mocks = vi.hoisted(() => ({
  session: { data: null as unknown, isPending: false },
  push: vi.fn(async () => {}),
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => mocks.session },
}));

function renderGuarded(requireAuth?: boolean, asPath = "/library") {
  return render(
    <UIProvider
      hooks={{
        authPath: "/m/auth",
        useRouter: () => ({
          pathname: "/library",
          asPath,
          back: vi.fn(),
          push: mocks.push,
          query: new URLSearchParams(),
        }),
      }}
    >
      <SessionAuth requireAuth={requireAuth}>
        <p>secret</p>
      </SessionAuth>
    </UIProvider>,
  );
}

describe("getSafeRedirectPath", () => {
  it("keeps relative paths", () => {
    expect(getSafeRedirectPath("/library?x=1", "/home")).toBe("/library?x=1");
  });

  it.each([
    "//evil.example",
    "https://evil.example",
    "/\\evil",
    "/\n/evil.example",
    "/\t/evil.example",
    "",
    null,
    undefined,
  ])("falls back for %s", (value) => {
    expect(getSafeRedirectPath(value, "/home")).toBe("/home");
  });

  it("never returns to the sign-in page itself", () => {
    expect(
      getSafeRedirectPath("/m/auth?redirectTo=%2Flibrary", "/home", "/m/auth"),
    ).toBe("/home");
    expect(getSafeRedirectPath("/m/authors", "/home", "/m/auth")).toBe(
      "/m/authors",
    );
  });
});

describe("getAuthErrorKey", () => {
  it.each([
    ["account_not_linked", "account_not_linked"],
    ["email_not_found", "email_not_found"],
    ["access_denied", "access_denied"],
    ["state_mismatch", "expired"],
    ["please_restart_the_process", "expired"],
    ["unable_to_link_account", "unable_to_link_account"],
    ["whatever", "default"],
    [null, "default"],
  ])("maps %s to %s", (code, key) => {
    expect(getAuthErrorKey(code)).toBe(key);
  });

  it("recognizes both lockout codes", () => {
    expect(isLockedOutError("banned")).toBe(true);
    expect(isLockedOutError("BANNED_USER")).toBe(true);
    expect(isLockedOutError("access_denied")).toBe(false);
  });
});

describe("SessionAuth", () => {
  beforeEach(() => {
    mocks.push.mockClear();
  });
  afterEach(cleanup);

  it("redirects to sign-in with the current page when signed out", () => {
    mocks.session = { data: null, isPending: false };
    renderGuarded();
    expect(screen.queryByText("secret")).toBeNull();
    expect(mocks.push).toHaveBeenCalledWith("/m/auth?redirectTo=%2Flibrary", {
      absolute: true,
    });
  });

  it("does not nest the sign-in page into redirectTo when already on it", () => {
    mocks.session = { data: null, isPending: false };
    renderGuarded(true, "/m/auth?redirectTo=%2Flibrary");
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("renders children when signed in", () => {
    mocks.session = { data: { user: { id: "u1" } }, isPending: false };
    renderGuarded();
    expect(screen.getByText("secret")).toBeTruthy();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("renders nothing while pending", () => {
    mocks.session = { data: null, isPending: true };
    renderGuarded();
    expect(screen.queryByText("secret")).toBeNull();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("renders children for signed-out users when auth is not required", () => {
    mocks.session = { data: null, isPending: false };
    renderGuarded(false);
    expect(screen.getByText("secret")).toBeTruthy();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
