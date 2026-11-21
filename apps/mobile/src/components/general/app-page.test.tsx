// @vitest-environment jsdom
import type { PropsWithChildren } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { setupDom } from "@/components/mcp/testUtils";
import { AppPage } from "./AppPage";
import { SignedOutTabPlaceholder } from "./SignedOutTabPlaceholder";

const { redirectToAuth } = vi.hoisted(() => ({
  redirectToAuth: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@repo/ui", () => ({
  authClient: { useSession: () => ({ data: null, isPending: false }) },
  useUserId: () => undefined,
  useRedirectToAuth: () => redirectToAuth,
}));
vi.mock("./header/HeaderSearchButton.tsx", () => ({
  HeaderSearchButton: () => null,
}));
vi.mock("./QueryProgressBar", () => ({ QueryProgressBar: () => null }));
vi.mock("./ScrollableIonContent.tsx", () => ({
  ScrollableIonContent: ({ children }: PropsWithChildren) => <>{children}</>,
}));

afterEach(cleanup);

it("uses the same return-aware sign-in from the header and the tab", () => {
  setupDom();
  render(
    <MantineProvider>
      <AppPage withMenuButton withSearch={false}>
        <SignedOutTabPlaceholder screen="library" />
      </AppPage>
    </MantineProvider>,
  );

  const buttons = screen.getAllByText("actions.loginCta");
  expect(buttons).toHaveLength(2);
  fireEvent.click(buttons[0]!);
  expect(redirectToAuth).toHaveBeenCalledTimes(1);
  fireEvent.click(buttons[1]!);
  expect(redirectToAuth).toHaveBeenCalledTimes(2);
});
