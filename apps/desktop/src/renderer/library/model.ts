import { getSizedImageUrl, type ImageSize } from "@repo/ui/image";

export interface LibraryGame {
  key: string;
  source: string;
  name: string;
  coverUrl?: string;
  year?: number;
  gameId?: number;
}
export type Filter = "all" | string;
export type SortColumn = "name" | "store" | "year";
export interface Sort {
  column: SortColumn;
  direction: "asc" | "desc";
}
export const gameName = (game: LibraryGame) => game.name;
export const gameYear = (game: LibraryGame) => game.year || 0;
export const gameCover = (game: LibraryGame, size: ImageSize) => {
  const url = getSizedImageUrl(game.coverUrl, size);
  // getSizedImageUrl returns an error string for non-IGDB URLs.
  return url?.startsWith("https://") ? url : undefined;
};
export function matchesFilter(game: LibraryGame, filter: Filter) {
  return filter === "all" || game.source === filter;
}
export function filterCounts(games: LibraryGame[]) {
  const counts: Record<string, number> = { all: games.length };
  for (const game of games)
    counts[game.source] = (counts[game.source] || 0) + 1;
  return counts;
}
export function filterAndSort(
  games: LibraryGame[],
  filter: Filter,
  text: string,
  sort: Sort,
) {
  const query = text.trim().toLocaleLowerCase();
  return games
    .filter(
      (game) =>
        matchesFilter(game, filter) &&
        gameName(game).toLocaleLowerCase().includes(query),
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sort.column) {
        case "name":
          comparison = gameName(a).localeCompare(gameName(b));
          break;
        case "store":
          comparison = a.source.localeCompare(b.source);
          break;
        case "year":
          comparison = gameYear(a) - gameYear(b);
          break;
      }
      return (
        (comparison || a.key.localeCompare(b.key)) *
        (sort.direction === "asc" ? 1 : -1)
      );
    });
}

export interface Selection {
  focused?: string;
  anchor?: string;
  selected: Set<string>;
}
export type SelectionAction =
  | { type: "focus" | "select" | "toggle" | "range"; id: string; ids: string[] }
  | { type: "all"; ids: string[] }
  | { type: "prune"; ids: string[] };
export const initialSelection: Selection = { selected: new Set() };
export function selectionReducer(
  state: Selection,
  action: SelectionAction,
): Selection {
  const ids = action.ids;
  if (action.type === "all") return { ...state, selected: new Set(ids) };
  if (action.type === "prune") {
    const visible = new Set(ids);
    return {
      focused:
        state.focused && visible.has(state.focused)
          ? state.focused
          : state.focused
            ? ids[0]
            : undefined,
      anchor:
        state.anchor && visible.has(state.anchor) ? state.anchor : undefined,
      selected: new Set([...state.selected].filter((id) => visible.has(id))),
    };
  }
  if (!ids.includes(action.id)) return state;
  if (action.type === "focus") return { ...state, focused: action.id };
  if (action.type === "range") {
    const anchor =
      state.anchor && ids.includes(state.anchor) ? state.anchor : action.id;
    const [from, to] = [ids.indexOf(anchor), ids.indexOf(action.id)].sort(
      (a, b) => a - b,
    );
    return {
      focused: action.id,
      anchor,
      selected: new Set(ids.slice(from, to + 1)),
    };
  }
  const selected =
    action.type === "select" ? new Set<string>() : new Set(state.selected);
  if (action.type === "toggle" && selected.has(action.id))
    selected.delete(action.id);
  else selected.add(action.id);
  return { focused: action.id, anchor: action.id, selected };
}
