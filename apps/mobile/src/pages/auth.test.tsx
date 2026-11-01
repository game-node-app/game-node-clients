// @vitest-environment jsdom
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { setupDom } from "@/components/mcp/testUtils";
import AuthPage from "./auth";

const mocks = vi.hoisted(() => ({
  session: null as unknown,
  search: "",
  canGoBack: true,
  goBack: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@ionic/react", () => ({
  useIonRouter: () => ({
    canGoBack: () => mocks.canGoBack,
    goBack: mocks.goBack,
    push: mocks.push,
  }),
}));
vi.mock("@/components/general/hooks/useSearchParameters", () => ({
  useSearchParameters: () => new URLSearchParams(mocks.search),
}));
vi.mock("@/components/general/AppPage.tsx", () => ({
  AppPage: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@repo/ui", async () => ({
  ...(await vi.importActual<object>(
    "../../../../packages/ui/src/components/auth/getSafeRedirectPath",
  )),
  authClient: {
    useSession: () => ({ data: mocks.session, isPending: false }),
  },
  SignInScreen: () => <div>sign-in-screen</div>,
}));

const renderPage = () =>
  render(
    <MantineProvider>
      <AuthPage />
    </MantineProvider>,
  );

beforeEach(() => {
  setupDom();
  vi.clearAllMocks();
  mocks.session = null;
  mocks.search = "?redirectTo=%2Flibrary";
  mocks.canGoBack = true;
});
afterEach(cleanup);

describe("mobile AuthPage", () => {
  it("shows the sign-in screen while signed out", () => {
    renderPage();
    expect(screen.getByText("sign-in-screen")).toBeTruthy();
    expect(mocks.goBack).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("pops back to the page that asked for sign-in once signed in", () => {
    mocks.session = { user: {} };
    renderPage();
    expect(mocks.goBack).toHaveBeenCalledTimes(1);
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("replaces itself with the safe target when there is nothing to go back to", () => {
    mocks.session = { user: {} };
    mocks.canGoBack = false;
    renderPage();
    expect(mocks.push).toHaveBeenCalledWith("/library", "root", "replace");
  });

  it("never returns to the auth page itself", () => {
    mocks.session = { user: {} };
    mocks.canGoBack = false;
    mocks.search = "?redirectTo=%2Fm%2Fauth";
    renderPage();
    expect(mocks.push).toHaveBeenCalledWith("/home", "root", "replace");
  });
});
