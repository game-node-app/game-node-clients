import { describe, it, expect, vi } from "vitest";
import {
  SOURCES,
  filterAndSort,
  filterCounts,
  initialSelection,
  selectionReducer,
  loadOwnedSource,
  mergeOwnedSources,
  importOwnedGames,
  type OwnedGame,
  type SortColumn,
  type Source,
} from "./model";
import { readLayout, defaultLayout } from "./layout";

function game(
  id: number,
  source: Source,
  name = `Game ${id}`,
  year = 2000 + id,
  isInLibrary = false,
): OwnedGame {
  return {
    id,
    source,
    key: `${source}:${id}`,
    name,
    year,
    isInLibrary,
    uid: String(id),
  } as OwnedGame;
}
const games = [
  game(1, "steam", "Hollow Knight", 2017),
  game(2, "psn", "Celeste", 2018, true),
  game(3, "xbox", "Alan Wake", 2010),
];
describe("owned library data", () => {
  it("pages using actual response length, keeps imported games, merges without losing cross-store ownership", async () => {
    const page = vi
      .fn()
      .mockResolvedValueOnce({
        data: [games[0]],
        pagination: { hasNextPage: true },
      })
      .mockResolvedValueOnce({
        data: [game(2, "steam", "Celeste", 2018, true)],
        pagination: { hasNextPage: false },
      });
    const steam = await loadOwnedSource("steam", page);
    expect(page.mock.calls).toEqual([
      ["steam", false, 500, 0],
      ["steam", false, 500, 1],
    ]);
    expect(steam).toHaveLength(2);
    expect(steam[1].isInLibrary).toBe(true);
    expect(
      mergeOwnedSources([steam, undefined, steam, [games[1]]]).map(
        (game) => game.key,
      ),
    ).toEqual(["steam:1", "steam:2", "psn:2"]);
  });
  it("rejects a stalled page and respects cancellation", async () => {
    await expect(
      loadOwnedSource("steam", async () => ({
        data: [],
        pagination: { hasNextPage: true, totalItems: 1, totalPages: 1 },
      })),
    ).rejects.toThrow("empty page");
    const controller = new AbortController();
    controller.abort();
    const page = vi.fn();
    await expect(
      loadOwnedSource("steam", page, controller.signal),
    ).rejects.toThrow();
    expect(page).not.toHaveBeenCalled();
  });
});
describe("filters, counts and sort", () => {
  it("matches names without case sensitivity", () =>
    expect(
      filterAndSort(games, "all", " HOLLOW ", {
        column: "name",
        direction: "asc",
      }),
    ).toEqual([games[0]]));
  it("covers all store and library filters with counts", () => {
    const counts = filterCounts(games);
    for (const filter of [
      "all",
      "in-library",
      "not-imported",
      ...SOURCES,
    ] as const) {
      const result = filterAndSort(games, filter, "", {
        column: "name",
        direction: "asc",
      });
      expect(result).toHaveLength(counts[filter]);
      expect(
        result.every(
          (game) =>
            filter === "all" ||
            (filter === "in-library"
              ? game.isInLibrary
              : filter === "not-imported"
                ? !game.isInLibrary
                : game.source === filter),
        ),
      ).toBe(true);
    }
    expect(counts).toEqual({
      all: 3,
      "in-library": 1,
      "not-imported": 2,
      steam: 1,
      psn: 1,
      xbox: 1,
      epicgames: 0,
      nintendo: 0,
    });
  });
  it.each([
    ["name", [3, 2, 1]],
    ["store", [2, 1, 3]],
    ["year", [3, 1, 2]],
    ["in-library", [1, 3, 2]],
  ] as [SortColumn, number[]][])("sorts %s both ways", (column, expected) => {
    expect(
      filterAndSort(games, "all", "", { column, direction: "asc" }).map(
        (game) => game.id,
      ),
    ).toEqual(expected);
    expect(
      filterAndSort(games, "all", "", { column, direction: "desc" }).map(
        (game) => game.id,
      ),
    ).toEqual([...expected].reverse());
    expect(games[0].id).toBe(1);
  });
});
describe("selection", () => {
  const ids = ["a", "b", "c", "d", "e"];
  it("focuses without selecting, toggles, ranges from the anchor and selects all", () => {
    let state = selectionReducer(initialSelection, { type: "prune", ids });
    expect(state.focused).toBeUndefined();
    state = selectionReducer(state, { type: "focus", id: "c", ids });
    expect(state.selected.size).toBe(0);
    state = selectionReducer(state, { type: "toggle", id: "c", ids });
    expect([...state.selected]).toEqual(["c"]);
    state = selectionReducer(state, { type: "toggle", id: "c", ids });
    expect(state.selected.size).toBe(0);
    state = selectionReducer(state, { type: "select", id: "b", ids });
    state = selectionReducer(state, { type: "range", id: "e", ids });
    expect([...state.selected]).toEqual(["b", "c", "d", "e"]);
    state = selectionReducer(state, { type: "range", id: "c", ids });
    expect([...state.selected]).toEqual(["b", "c"]);
    state = selectionReducer(state, { type: "all", ids });
    expect([...state.selected]).toEqual(ids);
    state = selectionReducer(state, { type: "prune", ids: ["e"] });
    expect([...state.selected]).toEqual(["e"]);
    expect(state.focused).toBe("e");
    expect(
      selectionReducer(state, { type: "toggle", id: "missing", ids }),
    ).toBe(state);
  });
});
describe("batch import", () => {
  it("groups by store, skips imported games, forwards collections and reports counts", async () => {
    const send = vi
      .fn()
      .mockResolvedValue({ importedCount: 1, skippedCount: 0 });
    const completed = vi.fn();
    const count = await importOwnedGames(
      [...games, games[0]],
      ["collection"],
      send,
      completed,
    );
    expect(send.mock.calls).toEqual([
      ["steam", { externalGameIds: [1], collectionIds: ["collection"] }],
      ["xbox", { externalGameIds: [3], collectionIds: ["collection"] }],
    ]);
    expect(count).toBe(2);
    expect(completed.mock.calls).toEqual([["steam"], ["xbox"]]);
  });
  it("keeps input unchanged on failure and invalidates successful sources before a later failure", async () => {
    const before = structuredClone(games);
    const send = vi
      .fn()
      .mockResolvedValueOnce({ importedCount: 1 })
      .mockRejectedValueOnce(new Error("down"));
    const completed = vi.fn();
    await expect(importOwnedGames(games, [], send, completed)).rejects.toThrow(
      "down",
    );
    expect(games).toEqual(before);
    expect(completed.mock.calls).toEqual([["steam"]]);
  });
});
it("restores layout and falls back safely for invalid storage", () => {
  expect(readLayout("bad json")).toEqual(defaultLayout);
  expect(readLayout("null")).toEqual(defaultLayout);
  expect(
    readLayout(
      JSON.stringify({
        view: "list",
        sort: { column: "year", direction: "desc" },
        filter: "psn",
        sidebar: 10000,
        detail: -1,
      }),
    ),
  ).toEqual({
    view: "list",
    sort: { column: "year", direction: "desc" },
    filter: "psn",
    sidebar: 300,
    detail: 220,
  });
});
