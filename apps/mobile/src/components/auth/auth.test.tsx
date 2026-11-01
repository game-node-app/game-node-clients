// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { DefaultIonLifeCycleContext, IonLifeCycleContext } from "@ionic/react";
import {
  IonViewActiveProvider,
  useIonViewActive,
} from "../general/hooks/useIonViewActive";
import { SessionAuth } from "../../../../../packages/ui/src/components/auth/SessionAuth";
import { getSafeRedirectPath } from "../../../../../packages/ui/src/components/auth/getSafeRedirectPath";
import {
  getAuthErrorKey,
  isLockedOutError,
} from "../../../../../packages/ui/src/components/auth/getAuthErrorKey";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

const mocks = vi.hoisted(() => ({
  session: { data: null as unknown, isPending: false },
  push: vi.fn(async (_url: string, _options?: unknown) => {}),
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => mocks.session },
}));

function guardedView(
  requireAuth?: boolean,
  asPath = "/library",
  lifecycle?: InstanceType<typeof DefaultIonLifeCycleContext>,
  showGuard = true,
) {
  const guard = (
    <UIProvider
      hooks={{
        authPath: "/m/auth",
        useIsViewActive: lifecycle ? useIonViewActive : undefined,
        useRouter: () => ({
          pathname: "/library",
          asPath,
          back: vi.fn(),
          push: async (...args) => mocks.push(...args),
          query: new URLSearchParams(),
        }),
      }}
    >
      {showGuard && (
        <SessionAuth requireAuth={requireAuth}>
          <p>secret</p>
        </SessionAuth>
      )}
    </UIProvider>
  );
  return lifecycle ? (
    <IonLifeCycleContext.Provider value={lifecycle}>
      <IonViewActiveProvider>{guard}</IonViewActiveProvider>
    </IonLifeCycleContext.Provider>
  ) : (
    guard
  );
}

const renderGuarded = (requireAuth?: boolean, asPath = "/library") =>
  render(guardedView(requireAuth, asPath));

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

  it("does not consume the redirect while Ionic still reports the previous auth URL", () => {
    mocks.session = { data: null, isPending: false };
    const lifecycle = new DefaultIonLifeCycleContext();
    const page = render(
      guardedView(true, "/m/auth?redirectTo=%2Flibrary", lifecycle),
    );
    act(() => lifecycle.ionViewDidEnter());
    expect(mocks.push).not.toHaveBeenCalled();

    page.rerender(guardedView(true, "/notifications", lifecycle));
    act(() => lifecycle.ionViewDidEnter());
    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith(
      "/m/auth?redirectTo=%2Fnotifications",
      { absolute: true },
    );
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

  it.each([
    "/library",
    "/profile",
    "/home/preferences",
    "/home/connections/callback/steam",
    "/notifications",
  ])("redirects again on returning to the cached page %s", (path) => {
    mocks.session = { data: null, isPending: false };
    const lifecycle = new DefaultIonLifeCycleContext();
    const page = render(guardedView(true, path, lifecycle));
    expect(mocks.push).not.toHaveBeenCalled();
    act(() => lifecycle.ionViewDidEnter());
    page.rerender(guardedView(true, path, lifecycle));
    expect(mocks.push).toHaveBeenCalledTimes(1);

    act(() => lifecycle.ionViewWillLeave());
    page.rerender(
      guardedView(true, "/m/auth?redirectTo=%2Flibrary", lifecycle),
    );
    page.rerender(guardedView(true, path, lifecycle));
    expect(mocks.push).toHaveBeenCalledTimes(1);

    act(() => lifecycle.ionViewDidEnter());
    page.rerender(guardedView(true, path, lifecycle));
    expect(mocks.push).toHaveBeenCalledTimes(2);
    expect(mocks.push).toHaveBeenLastCalledWith(
      `/m/auth?redirectTo=${encodeURIComponent(path)}`,
      { absolute: true },
    );
    expect(screen.queryByText("secret")).toBeNull();
  });

  it("does not redirect when returning through a pending session to a signed-in page", () => {
    mocks.session = { data: null, isPending: false };
    const lifecycle = new DefaultIonLifeCycleContext();
    const view = () => guardedView(true, "/library", lifecycle);
    const page = render(view());
    act(() => lifecycle.ionViewDidEnter());
    act(() => lifecycle.ionViewWillLeave());

    mocks.session = { data: null, isPending: true };
    page.rerender(view());
    act(() => lifecycle.ionViewDidEnter());
    expect(mocks.push).toHaveBeenCalledTimes(1);

    mocks.session = { data: { user: { id: "u1" } }, isPending: false };
    page.rerender(view());
    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(screen.getByText("secret")).toBeTruthy();
  });

  it("waits for a pending session to settle before redirecting on re-entry", () => {
    mocks.session = { data: null, isPending: false };
    const lifecycle = new DefaultIonLifeCycleContext();
    const view = () => guardedView(true, "/library", lifecycle);
    const page = render(view());
    act(() => lifecycle.ionViewDidEnter());
    act(() => lifecycle.ionViewWillLeave());
    mocks.session = { data: null, isPending: true };
    page.rerender(view());
    act(() => lifecycle.ionViewDidEnter());
    expect(mocks.push).toHaveBeenCalledTimes(1);

    mocks.session = { data: null, isPending: false };
    page.rerender(view());
    expect(mocks.push).toHaveBeenCalledTimes(2);
  });

  it("leaves hidden cached guards idle when the session changes", () => {
    mocks.session = { data: { user: { id: "u1" } }, isPending: false };
    const lifecycle = new DefaultIonLifeCycleContext();
    const view = () => guardedView(true, "/home", lifecycle);
    const page = render(view());
    act(() => lifecycle.ionViewWillLeave());
    mocks.session = { data: null, isPending: false };
    page.rerender(view());
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("keeps public pages accessible across mobile page entries", () => {
    mocks.session = { data: null, isPending: false };
    const lifecycle = new DefaultIonLifeCycleContext();
    render(guardedView(false, "/profile/u1", lifecycle));
    act(() => lifecycle.ionViewWillLeave());
    act(() => lifecycle.ionViewDidEnter());
    expect(mocks.push).not.toHaveBeenCalled();
    expect(screen.getByText("secret")).toBeTruthy();
  });

  it("redirects guards mounted after their page has already entered", () => {
    mocks.session = { data: null, isPending: false };
    const lifecycle = new DefaultIonLifeCycleContext();
    const page = render(guardedView(true, "/library", lifecycle, false));
    act(() => lifecycle.ionViewDidEnter());
    page.rerender(guardedView(true, "/library", lifecycle));
    expect(mocks.push).toHaveBeenCalledTimes(1);
  });
});
