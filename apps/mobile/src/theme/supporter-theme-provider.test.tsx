// @vitest-environment jsdom
import { BillingService } from "@repo/wrapper/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  useAppTheme,
  useHasSupporterThemeAccess,
} from "../../../../packages/ui/src/theme/AppThemeProvider";
import { SupporterThemeProvider } from "../../../../packages/ui/src/theme/SupporterThemeProvider";
import { createThemePackStore } from "../../../../packages/ui/src/theme/packs/store";

const { useSession } = vi.hoisted(() => ({
  useSession: vi.fn<
    [],
    {
      isPending: boolean;
      data: { user: { id: string } } | null;
      error?: { status: number };
    }
  >(),
}));

vi.mock("../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession },
}));

function ThemeProbe() {
  const [id] = useAppTheme();
  const hasAccess = useHasSupporterThemeAccess();
  return (
    <span data-testid="theme" data-has-access={hasAccess}>
      {id}
    </span>
  );
}

const storage = { get: () => "xbox", set: vi.fn() };
const packStore = createThemePackStore();

function renderApp(initialTheme = "gamenode") {
  const queryClient = new QueryClient();
  const app = () => (
    <QueryClientProvider client={queryClient}>
      <SupporterThemeProvider
        initialTheme={initialTheme}
        themeStorage={storage}
        packStore={packStore}
        suspendOnInitialPack={false}
      >
        <ThemeProbe />
      </SupporterThemeProvider>
    </QueryClientProvider>
  );
  const view = render(app());
  return { rerender: () => view.rerender(app()), queryClient };
}

function setSession(userId: string | null, isPending = false) {
  useSession.mockReturnValue({
    data: userId ? { user: { id: userId } } : null,
    isPending,
  });
}

type BillingStatus = Awaited<
  ReturnType<typeof BillingService.billingControllerGetMeV1>
>;

function billingStatus(isSupporter: boolean): BillingStatus {
  return { isSupporter } as BillingStatus;
}

function expectTheme(id: string, hasAccess: boolean) {
  const theme = screen.getByTestId("theme");
  expect(theme.textContent).toBe(id);
  expect(theme.dataset.hasAccess).toBe(String(hasAccess));
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Supporter theme access", () => {
  it("starts with the saved theme and reverts only after a delayed denial", async () => {
    let resolveStatus!: (status: BillingStatus) => void;
    const status = new Promise<BillingStatus>((resolve) => {
      resolveStatus = resolve;
    });
    const billing = vi
      .spyOn(BillingService, "billingControllerGetMeV1")
      .mockImplementation(
        () =>
          status as ReturnType<typeof BillingService.billingControllerGetMeV1>,
      );

    setSession(null, true);
    const { rerender } = renderApp();
    expectTheme("xbox", false);
    expect(billing).not.toHaveBeenCalled();

    setSession("free");
    rerender();
    await waitFor(() => expect(billing).toHaveBeenCalledTimes(1));
    expectTheme("xbox", false);

    resolveStatus(billingStatus(false));
    await waitFor(() => expectTheme("gamenode", false));
    expect(storage.set).not.toHaveBeenCalled();

    setSession(null, true);
    rerender();
    expectTheme("gamenode", false);
  });

  it("keeps the initial theme through billing errors and enables it on confirmation", async () => {
    const billing = vi
      .spyOn(BillingService, "billingControllerGetMeV1")
      .mockRejectedValueOnce(new Error("Billing unavailable"))
      .mockResolvedValueOnce(billingStatus(true))
      .mockResolvedValueOnce(billingStatus(false));

    setSession("supporter");
    const { queryClient } = renderApp("xbox");
    const queryKey = ["billing", "me", "supporter", "theme"];
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKey)?.status).toBe("error"),
    );
    expectTheme("xbox", false);

    void queryClient.invalidateQueries({ queryKey });
    await waitFor(() => expectTheme("xbox", true));

    void queryClient.invalidateQueries({ queryKey });
    await waitFor(() => expectTheme("gamenode", false));
    expect(billing).toHaveBeenCalledTimes(3);
  });

  it("keeps the saved theme when session verification fails and reverts on confirmed sign-out", () => {
    useSession.mockReturnValue({
      data: null,
      isPending: false,
      error: { status: 503 },
    });
    const { rerender } = renderApp("xbox");
    expectTheme("xbox", false);

    setSession(null);
    rerender();
    expectTheme("gamenode", false);
  });
});
