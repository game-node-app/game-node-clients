// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import ExploreScreenFilters from "../../../../web/src/components/explore/ExploreScreenFilters";
import { DEFAULT_EXPLORE_TRENDING_GAMES_DTO } from "../../../../web/src/components/explore/utils";
const state = vi.hoisted(() => ({
  router: {
    query: {
      period: "month",
      genres: "2,3",
      ids: "7",
      status: "0,2",
      category: "0,14",
    },
    isReady: true,
    replace: vi.fn(),
  },
}));
vi.mock("next/router", () => ({ useRouter: () => state.router }));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock(
  "../../../../web/src/components/explore/ExploreScreenResourceSelector",
  () => ({ default: () => null }),
);
vi.mock("@mantine/hooks", async () => ({
  ...(await vi.importActual<typeof import("@mantine/hooks")>("@mantine/hooks")),
  useDisclosure: () => [false, { open: vi.fn(), close: vi.fn() }],
}));
vi.mock("@mantine/core", async () => {
  const React = await import("react");
  const actual =
    await vi.importActual<typeof import("@mantine/core")>("@mantine/core");
  const C = ({ children }: import("react").PropsWithChildren) =>
    React.createElement("div", null, children);
  return {
    ...actual,
    ActionIcon: C,
    Button: C,
    Center: C,
    Drawer: C,
    Group: C,
    SimpleGrid: C,
    Select: ({ onChange }: { onChange: (value: string) => void }) =>
      React.createElement(
        "button",
        { onClick: () => onChange("all") },
        "Change period",
      ),
  };
});
afterEach(() => {
  cleanup();
  state.router.replace.mockClear();
});

it("retains selected criteria when only the period changes", async () => {
  function Fixture() {
    const [dto, setDto] = useState(DEFAULT_EXPLORE_TRENDING_GAMES_DTO);
    const [loaded, setLoaded] = useState(false);
    return (
      <>
        <span data-testid="dto">{JSON.stringify(dto)}</span>
        <ExploreScreenFilters
          hasLoadedQueryParams={loaded}
          onFilterChange={(next) => {
            setDto(next);
            setLoaded(true);
          }}
        />
      </>
    );
  }
  render(<Fixture />);
  await waitFor(() =>
    expect(screen.getByTestId("dto").textContent).toContain('"genres":[2,3]'),
  );
  fireEvent.click(screen.getByText("Change period"));
  await waitFor(() =>
    expect(JSON.parse(screen.getByTestId("dto").textContent!)).toEqual({
      limit: 20,
      period: "all",
      criteria: { ids: [7], status: [0, 2], category: [0, 14], genres: [2, 3] },
    }),
  );
  expect(state.router.replace).toHaveBeenCalled();
});
