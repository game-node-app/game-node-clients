// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PreferencesSupporterPage from "../../pages/preferences_supporter";

type SupporterSettingsViewProps = {
  checkout?: "success" | "cancel" | null;
  interval?: "monthly" | "yearly" | null;
  onCheckoutStarted?: () => void;
};

const mocks = vi.hoisted(() => ({
  search: "",
  pendingCheckout: false,
  onCheckoutStarted: vi.fn(),
  appPage: undefined as { title?: string; withSearch?: boolean } | undefined,
  props: undefined as SupporterSettingsViewProps | undefined,
}));

vi.mock("@/components/general/AppPage", () => ({
  AppPage: ({
    children,
    title,
    withSearch,
  }: PropsWithChildren<{ title?: string; withSearch?: boolean }>) => {
    mocks.appPage = { title, withSearch };
    return <>{children}</>;
  },
}));
vi.mock("@/components/general/hooks/useSearchParameters", () => ({
  useSearchParameters: () => new URLSearchParams(mocks.search),
}));
vi.mock("@/components/supporter/useSupporterCheckoutTracking", () => ({
  useSupporterCheckoutTracking: () => ({
    pendingCheckout: mocks.pendingCheckout,
    onCheckoutStarted: mocks.onCheckoutStarted,
  }),
}));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@repo/ui", () => ({
  SessionAuth: ({ children }: PropsWithChildren) => <>{children}</>,
  SupporterSettingsView: (props: SupporterSettingsViewProps) => {
    mocks.props = props;
    return <div>supporter-settings-view</div>;
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.search = "";
  mocks.pendingCheckout = false;
  mocks.appPage = undefined;
  mocks.props = undefined;
});

afterEach(cleanup);

describe("mobile PreferencesSupporterPage", () => {
  it("renders the shared settings view with no checkout result by default", () => {
    render(<PreferencesSupporterPage />);

    expect(screen.getByText("supporter-settings-view")).toBeTruthy();
    expect(mocks.appPage).toEqual({
      title: "settings.tabs.premium.title",
      withSearch: false,
    });
    expect(mocks.props?.checkout).toBeNull();
    expect(mocks.props?.interval).toBeNull();
    expect(mocks.props?.onCheckoutStarted).toBe(mocks.onCheckoutStarted);
  });

  it("parses a success return and the selected interval from the location", () => {
    mocks.search = "?checkout=success&interval=yearly";

    render(<PreferencesSupporterPage />);

    expect(mocks.props?.checkout).toBe("success");
    expect(mocks.props?.interval).toBe("yearly");
  });

  it("drops checkout and interval values outside the contract", () => {
    mocks.search = "?checkout=unknown&interval=weekly";

    render(<PreferencesSupporterPage />);

    expect(mocks.props?.checkout).toBeNull();
    expect(mocks.props?.interval).toBeNull();
  });

  it("uses the local pending state as a success return when the URL has none", () => {
    mocks.pendingCheckout = true;

    render(<PreferencesSupporterPage />);

    expect(mocks.props?.checkout).toBe("success");
  });

  it("lets the route result win over the local pending state", () => {
    mocks.pendingCheckout = true;
    mocks.search = "?checkout=cancel";

    render(<PreferencesSupporterPage />);

    expect(mocks.props?.checkout).toBe("cancel");
  });
});
