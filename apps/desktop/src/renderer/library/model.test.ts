import { describe, it, expect } from "vitest";
import {
  filterAndSort,
  filterCounts,
  initialSelection,
  selectionReducer,
  gameCover,
  type LibraryGame,
  type SortColumn,
} from "./model";
import { ImageSize } from "@repo/ui/image";
import { readLayout, defaultLayout } from "./layout";

function game(
  id: number,
  source: string,
  name = `Game ${id}`,
  year = 2000 + id,
): LibraryGame {
  return {
    source,
    key: `${source}:${id}`,
    name,
    year,
  } as LibraryGame;
}
const games = [
  game(1, "steam", "Hollow Knight", 2017),
  game(2, "psn", "Celeste", 2018),
  game(3, "xbox", "Alan Wake", 2010),
];
describe("filters, counts and sort", () => {
  it("matches names without case sensitivity", () =>
    expect(
      filterAndSort(games, "all", " HOLLOW ", {
        column: "name",
        direction: "asc",
      }),
    ).toEqual([games[0]]));
  it("counts and filters arbitrary desktop sources", () => {
    const local = [...games, game(4, "custom")];
    expect(filterCounts(local)).toEqual({
      all: 4,
      steam: 1,
      psn: 1,
      xbox: 1,
      custom: 1,
    });
    for (const filter of ["all", "steam", "psn", "xbox", "custom"])
      expect(
        filterAndSort(local, filter, "", { column: "name", direction: "asc" }),
      ).toHaveLength(filterCounts(local)[filter]);
    expect(filterCounts([])).toEqual({ all: 0 });
  });
  it.each([
    ["name", [3, 2, 1]],
    ["store", [2, 1, 3]],
    ["year", [3, 1, 2]],
  ] as [SortColumn, number[]][])("sorts %s both ways", (column, expected) => {
    expect(
      filterAndSort(games, "all", "", { column, direction: "asc" }).map(
        (game) => Number(game.key.split(":")[1]),
      ),
    ).toEqual(expected);
    expect(
      filterAndSort(games, "all", "", { column, direction: "desc" }).map(
        (game) => Number(game.key.split(":")[1]),
      ),
    ).toEqual([...expected].reverse());
    expect(games[0].key).toBe("steam:1");
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

describe("game covers", () => {
  const withCover = (url?: string) =>
    ({ coverUrl: url }) as unknown as LibraryGame;
  const igdb = "images.igdb.com/igdb/image/upload/t_thumb/co1abc.jpg";

  it("requests the sized IGDB cover", () => {
    expect(gameCover(withCover(`https://${igdb}`), ImageSize.COVER_BIG)).toBe(
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co1abc.jpg",
    );
  });
  it("accepts protocol-relative URLs", () => {
    expect(gameCover(withCover(`//${igdb}`), ImageSize.COVER_BIG_2X)).toBe(
      "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co1abc.jpg",
    );
  });
  it("returns nothing for non-IGDB or missing covers", () => {
    expect(
      gameCover(withCover("https://example.com/a.jpg"), ImageSize.COVER_BIG),
    ).toBeUndefined();
    expect(gameCover(withCover(), ImageSize.COVER_BIG)).toBeUndefined();
    expect(
      gameCover({ key: "x" } as LibraryGame, ImageSize.COVER_BIG),
    ).toBeUndefined();
  });
});

it("preserves a future source filter and drops the removed sort column", () => {
  const layout = readLayout(
    JSON.stringify({ filter: "custom", sort: { column: "in-library" } }),
  );
  expect(layout.filter).toBe("custom");
  expect(layout.sort.column).toBe("name");
});
