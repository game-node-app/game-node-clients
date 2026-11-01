// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { SignInScreen } from "../../../../../packages/ui/src/components/auth/sign-in/SignInScreen";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { getOAuthRequest } from "../../../../../packages/ui/src/components/auth/oauthRequest";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";
import { renderMcp, setupDom, signedQuery } from "../mcp/testUtils";
const originalLocation = window.location;
const mocks = vi.hoisted(() => ({
  session: null as unknown,
  query: new URLSearchParams(),
  push: vi.fn(),
  social: vi.fn(),
  fetch: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({ data: mocks.session, isPending: false }),
    signIn: { social: mocks.social },
    $fetch: mocks.fetch,
  },
}));
vi.mock(
  "../../../../../packages/ui/src/components/general/GameNodeLogo",
  () => ({ GameNodeLogo: () => null }),
);
function renderSignIn(relativeCallbacks = false) {
  return renderMcp(
    <UIProvider
      hooks={{
        useRouter: () => ({
          pathname: "/auth",
          query: mocks.query,
          push: mocks.push,
          back: vi.fn(),
        }),
      }}
    >
      <SignInScreen
        newUserPath="/wizard/init"
        relativeCallbacks={relativeCallbacks}
      />
    </UIProvider>,
  );
}
beforeEach(() => {
  setupDom();
  vi.clearAllMocks();
  mocks.session = null;
  mocks.query = signedQuery();
  mocks.social.mockResolvedValue({ error: null });
  mocks.fetch.mockResolvedValue({
    data: { redirect: true, url: "https://website.example/oauth/consent" },
    error: null,
  });
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { origin: "https://website.example", assign: mocks.navigate },
  });
});
afterEach(() => {
  cleanup();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
});
describe("OAuth sign-in", () => {
  it("keeps repeated signed parameters through social, errors, dismiss and onboarding", async () => {
    const original = mocks.query.toString();
    mocks.query.append("error", "access_denied");
    renderSignIn();
    fireEvent.click(screen.getByRole("button", { name: /google/i }));
    await waitFor(() => expect(mocks.social).toHaveBeenCalled());
    const options = mocks.social.mock.calls[0][0];
    expect(options.callbackURL).toBe(
      `https://website.example/auth?${original}`,
    );
    expect(options.errorCallbackURL).toBe(options.callbackURL);
    expect(options.newUserCallbackURL).toBe(options.callbackURL);
    expect(getOAuthRequest(mocks.query)?.oauthQuery).toBe(original);
    expect(
      new URLSearchParams(getOAuthRequest(mocks.query)!.oauthQuery).getAll(
        "resource",
      ),
    ).toHaveLength(2);
  });
  it("dismisses errors without dropping OAuth context", () => {
    mocks.query.append("error", "access_denied");
    renderSignIn();
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(mocks.push).toHaveBeenCalledWith(`/auth?${signedQuery()}`, {
      replace: true,
      absolute: true,
    });
  });
  it("redirects again after a session drops and a new sign-in completes", () => {
    mocks.query = new URLSearchParams("redirectTo=%2Flibrary");
    mocks.session = { user: { id: "u1" } };
    const view = renderSignIn(true);
    const rerender = () =>
      view.rerender(
        <I18nProvider language="en">
          <MantineProvider>
            <UIProvider
              hooks={{
                useRouter: () => ({
                  pathname: "/auth",
                  query: mocks.query,
                  push: mocks.push,
                  back: vi.fn(),
                }),
              }}
            >
              <SignInScreen newUserPath="/wizard/init" relativeCallbacks />
            </UIProvider>
          </MantineProvider>
        </I18nProvider>,
      );
    expect(mocks.push).toHaveBeenCalledTimes(1);
    mocks.session = null;
    rerender();
    mocks.session = { user: { id: "u1" } };
    rerender();
    expect(mocks.push).toHaveBeenCalledTimes(2);
    expect(mocks.push).toHaveBeenLastCalledWith("/library", {
      replace: true,
      absolute: true,
    });
  });
  it("hands the safe target to onSignedIn once per sign-in, never the auth page", () => {
    const onSignedIn = vi.fn();
    const view = (redirectTo: string) => {
      mocks.query = new URLSearchParams({ redirectTo });
      return (
        <I18nProvider language="en">
          <MantineProvider>
            <UIProvider
              hooks={{
                useRouter: () => ({
                  pathname: "/auth",
                  query: mocks.query,
                  push: mocks.push,
                  back: vi.fn(),
                }),
              }}
            >
              <SignInScreen onSignedIn={onSignedIn} />
            </UIProvider>
          </MantineProvider>
        </I18nProvider>
      );
    };
    mocks.session = { user: { id: "u1" } };
    const page = render(view("/library"));
    page.rerender(view("/library"));
    expect(onSignedIn).toHaveBeenCalledTimes(1);
    expect(onSignedIn).toHaveBeenLastCalledWith("/library");

    // Ionic keeps the page mounted: sign out, then sign in again with a bad target.
    mocks.session = null;
    page.rerender(view("/auth?redirectTo=%2Flibrary"));
    mocks.session = { user: { id: "u1" } };
    page.rerender(view("/auth?redirectTo=%2Flibrary"));
    expect(onSignedIn).toHaveBeenCalledTimes(2);
    expect(onSignedIn).toHaveBeenLastCalledWith("/home");
    expect(mocks.push).not.toHaveBeenCalled();
  });
  it("continues existing sessions exactly once", async () => {
    mocks.session = { user: { id: "u1" } };
    renderSignIn();
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalled());
    expect(mocks.fetch).toHaveBeenCalledWith("/oauth2/continue", {
      method: "POST",
      body: { selected: true, oauth_query: signedQuery().toString() },
    });

    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    expect(mocks.push).not.toHaveBeenCalled();
  });
  it("shows providers when the server requires fresh login without looping", async () => {
    mocks.session = { user: { id: "u1" } };
    mocks.fetch.mockResolvedValue({
      data: {
        redirect: true,
        url: `https://website.example/auth?${signedQuery()}`,
      },
    });
    renderSignIn();
    await screen.findByRole("button", { name: /google/i });
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
  it.each(["expired", "tampered", "transient"])(
    "stays in OAuth on %s rejection and permits retry",
    async () => {
      mocks.session = { user: { id: "u1" } };
      mocks.fetch.mockResolvedValueOnce({ error: { status: 400 } });
      renderSignIn();
      fireEvent.click(await screen.findByRole("button", { name: "Retry" }));
      await waitFor(() => expect(mocks.navigate).toHaveBeenCalled());
      expect(mocks.push).not.toHaveBeenCalled();
    },
  );
  it("rejects incomplete context without falling back home", () => {
    mocks.query.delete("sig");
    mocks.session = { user: { id: "u1" } };
    renderSignIn();
    expect(screen.getByRole("alert").textContent).toContain("invalid");
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });
  it.each(["/library?x=1", "https://evil.example", "//evil.example"])(
    "keeps ordinary callback protections for %s",
    (redirectTo) => {
      mocks.query = new URLSearchParams({ redirectTo });
      renderSignIn();
      fireEvent.click(screen.getByRole("button", { name: /google/i }));
      const options = mocks.social.mock.calls[0][0];
      expect(options.callbackURL).toBe(
        `https://website.example${
          redirectTo.startsWith("/library") ? redirectTo : "/home"
        }`,
      );
      expect(options.newUserCallbackURL).toBe(
        "https://website.example/wizard/init",
      );
    },
  );
  it("preserves native relative callback options", () => {
    mocks.query = new URLSearchParams();
    renderSignIn(true);
    fireEvent.click(screen.getByRole("button", { name: /google/i }));
    expect(mocks.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/home",
      errorCallbackURL: "/auth",
      newUserCallbackURL: "/wizard/init",
    });
  });
});
