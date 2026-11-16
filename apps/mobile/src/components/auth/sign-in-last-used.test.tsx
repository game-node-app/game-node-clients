// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { SignInScreen } from "../../../../../packages/ui/src/components/auth/sign-in/SignInScreen";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { renderMcp, setupDom } from "../mcp/testUtils";

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

const PROVIDER_LABELS = {
  google: /continue with google/i,
  discord: /continue with discord/i,
  twitter: /continue with x/i,
} as const;
type Provider = keyof typeof PROVIDER_LABELS;

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

function providerButton(provider: Provider) {
  return screen.getByRole("button", { name: PROVIDER_LABELS[provider] });
}

function expectOnlyLastUsed(provider: Provider) {
  for (const candidate of Object.keys(PROVIDER_LABELS) as Provider[]) {
    const badge = within(providerButton(candidate)).queryByText(/last used/i);
    if (candidate === provider) expect(badge).toBeTruthy();
    else expect(badge).toBeNull();
  }
  expect(screen.queryAllByText(/last used/i)).toHaveLength(1);
}

/** Finds the storage entry written for a provider without assuming the key. */
function storedProviderEntries(provider: Provider) {
  return Object.keys(window.localStorage)
    .map((key) => [key, window.localStorage.getItem(key)] as const)
    .filter(([, value]) => value?.includes(provider) ?? false);
}

async function expectProviderStored(provider: Provider) {
  await waitFor(() =>
    expect(storedProviderEntries(provider).length).toBeGreaterThan(0),
  );
}

function providerOrder() {
  return screen.getAllByRole("button").flatMap((button): Provider[] => {
    const text = button.textContent ?? "";
    const provider = (Object.keys(PROVIDER_LABELS) as Provider[]).find(
      (candidate) => PROVIDER_LABELS[candidate].test(text),
    );
    return provider ? [provider] : [];
  });
}

beforeEach(() => {
  setupDom();
  vi.clearAllMocks();
  window.localStorage.clear();
  mocks.session = null;
  mocks.query = new URLSearchParams();
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
  vi.restoreAllMocks();
  window.localStorage.clear();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
});

describe("last used sign-in provider", () => {
  it("shows no badge on a first visit", () => {
    renderSignIn();

    expect(providerButton("google")).toBeTruthy();
    expect(providerButton("discord")).toBeTruthy();
    expect(providerButton("twitter")).toBeTruthy();
    expect(screen.queryByText(/last used/i)).toBeNull();
  });

  it("keeps the clicked provider after the screen remounts", async () => {
    const first = renderSignIn();
    fireEvent.click(providerButton("google"));
    await expectProviderStored("google");
    expect(mocks.social).toHaveBeenCalledTimes(1);

    first.unmount();
    renderSignIn();

    await waitFor(() => expectOnlyLastUsed("google"));
  });

  it("marks only the most recently used provider and never reorders the buttons", async () => {
    const first = renderSignIn();
    fireEvent.click(providerButton("google"));
    await expectProviderStored("google");
    first.unmount();

    const second = renderSignIn();
    await waitFor(() => expectOnlyLastUsed("google"));
    expect(providerOrder()).toEqual(["google", "discord", "twitter"]);

    fireEvent.click(providerButton("discord"));
    await expectProviderStored("discord");
    second.unmount();

    renderSignIn();
    await waitFor(() => expectOnlyLastUsed("discord"));
    expect(providerOrder()).toEqual(["google", "discord", "twitter"]);
  });

  it("persists the provider with native relative callbacks", async () => {
    const first = renderSignIn(true);
    fireEvent.click(providerButton("google"));

    expect(mocks.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/home",
      errorCallbackURL: "/auth",
      newUserCallbackURL: "/wizard/init",
    });
    await expectProviderStored("google");
    first.unmount();

    renderSignIn(true);
    await waitFor(() => expectOnlyLastUsed("google"));
  });

  it.each(["not-a-provider", "{not-json", ""])(
    "ignores the invalid stored value %j",
    async (invalidValue) => {
      const first = renderSignIn();
      fireEvent.click(providerButton("google"));
      await expectProviderStored("google");
      const [key] = storedProviderEntries("google")[0];
      first.unmount();

      window.localStorage.setItem(key, invalidValue);
      renderSignIn();

      expect(providerButton("google")).toBeTruthy();
      expect(screen.queryByText(/last used/i)).toBeNull();
    },
  );

  it("still renders and starts sign-in when storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage is unavailable");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage is unavailable");
    });

    renderSignIn();

    expect(screen.queryByText(/last used/i)).toBeNull();
    fireEvent.click(providerButton("google"));

    await waitFor(() => expect(mocks.social).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(/last used/i)).toBeNull();
  });
});
