// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { GameRankingCriteriaDto } from "@repo/wrapper/server";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ExploreScreenFilters from "../../../../web/src/components/explore/ExploreScreenFilters";
import { setupDom } from "../mcp/testUtils";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock(
  "../../../../web/src/components/explore/ExploreScreenResourceSelector",
  () => ({
    default: ({
      label,
      onChange,
    }: {
      label: string;
      onChange: (value: string[]) => void;
    }) => (
      <button type="button" onClick={() => onChange([])}>
        {label}
      </button>
    ),
  }),
);
beforeEach(() => setupDom());
afterEach(cleanup);

const open = (criteria: GameRankingCriteriaDto) => {
  const onApply = vi.fn();
  render(
    <MantineProvider>
      <ExploreScreenFilters criteria={criteria} onApply={onApply} />
    </MantineProvider>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "explore.filters.title" }),
  );
  return onApply;
};

it("keeps the criteria it has no selector for", async () => {
  const onApply = open({
    ids: [7],
    status: [0, 2],
    genres: [2, 3],
    platforms: [6],
  });
  fireEvent.click(await screen.findByText("explore.filters.platforms"));
  fireEvent.click(screen.getByRole("button", { name: "common.search" }));
  await waitFor(() =>
    expect(onApply).toHaveBeenCalledWith({
      ids: [7],
      status: [0, 2],
      genres: [2, 3],
    }),
  );
});

it("goes back to the shelves when the filters are cleared", async () => {
  const onApply = open({ genres: [2] });
  fireEvent.click(
    await screen.findByRole("button", { name: "explore.filters.clear" }),
  );
  expect(onApply).toHaveBeenCalledWith(undefined);
});
