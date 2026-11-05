// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { UserConnectionDto } from "@repo/wrapper/server";
import PreferencesConnectionsItems from "./PreferencesConnectionsItems";
import { ProfileUserInfoConnections } from "../../../../../../packages/ui/src/components/profile/view/ProfileUserInfoConnections";

vi.mock("./PreferencesConnectionItem", () => ({
  default: ({ type }: { type: string }) => <span>{type}</span>,
}));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock(
  "../../../../../../packages/ui/src/components/connections/hooks/useUserConnections",
  () => ({
    useUserConnections: () => ({
      data: [{ type: "gog", sourceUserId: "123456", profileUserId: "user" }],
    }),
  }),
);
beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});
afterEach(cleanup);
it("includes every generated connection in mobile preferences", () => {
  render(<PreferencesConnectionsItems />);
  for (const type of Object.values(UserConnectionDto.type))
    expect(screen.getByText(type)).toBeTruthy();
});
it("renders a GOG profile icon without an external link", () => {
  render(
    <MantineProvider>
      <ProfileUserInfoConnections userId="user" />
    </MantineProvider>,
  );
  expect(screen.getByRole("img").getAttribute("src")).toContain(
    "/v1/public/icons/gog.png",
  );
  expect(screen.queryByRole("link")).toBeNull();
});
