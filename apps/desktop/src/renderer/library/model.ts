import { getSizedImageUrl, type ImageSize } from "@repo/ui/image";
import type {
  ImporterResponseItemDto,
  ImporterPaginatedResponseDto,
  ImporterBatchImportRequestDto,
  ImporterBatchImportResponseDto,
} from "@repo/wrapper/server";

export const SOURCES = [
  "steam",
  "psn",
  "xbox",
  "epicgames",
  "nintendo",
] as const;
export type Source = (typeof SOURCES)[number];
export const STORE_NAMES: Record<Source, string> = {
  steam: "Steam",
  psn: "PlayStation",
  xbox: "Xbox",
  epicgames: "Epic Games",
  nintendo: "Nintendo",
};
export type OwnedGame = ImporterResponseItemDto & {
  key: string;
  source: Source;
};
export type Filter = "all" | "in-library" | "not-imported" | Source;
export type SortColumn = "name" | "store" | "year" | "in-library";
export interface Sort {
  column: SortColumn;
  direction: "asc" | "desc";
}
export const gameName = (game: OwnedGame) =>
  game.name || game.game?.name || game.uid;
export const gameYear = (game: OwnedGame) =>
  game.year ||
  (game.game?.firstReleaseDate
    ? new Date(game.game.firstReleaseDate).getUTCFullYear()
    : 0);
export const gameCover = (game: OwnedGame, size: ImageSize) => {
  const url = getSizedImageUrl(game.game?.cover?.url, size);
  // getSizedImageUrl returns an error string for non-IGDB URLs
  return url?.startsWith("https://") ? url : undefined;
};

export async function loadOwnedSource(
  source: Source,
  page: (
    source: Source,
    exclude: boolean,
    limit: number,
    offset: number,
  ) => Promise<ImporterPaginatedResponseDto>,
  signal?: AbortSignal,
) {
  const games = new Map<string, OwnedGame>();
  let offset = 0;
  let hasNextPage = true;
  while (hasNextPage) {
    signal?.throwIfAborted();
    const result = await page(source, false, 500, offset);
    signal?.throwIfAborted();
    for (const game of result.data) {
      const key = `${source}:${game.id}`;
      games.set(key, { ...game, key, source });
    }
    hasNextPage = result.pagination.hasNextPage;
    if (!hasNextPage) break;
    if (!result.data.length)
      throw new Error("Store returned an empty page with more games pending");
    offset += result.data.length;
  }
  return [...games.values()];
}
export function mergeOwnedSources(sources: (OwnedGame[] | undefined)[]) {
  return [
    ...new Map(
      sources.flatMap((games) => games || []).map((game) => [game.key, game]),
    ).values(),
  ];
}
export function matchesFilter(game: OwnedGame, filter: Filter) {
  return (
    filter === "all" ||
    (filter === "in-library"
      ? game.isInLibrary
      : filter === "not-imported"
        ? !game.isInLibrary
        : game.source === filter)
  );
}
export function filterCounts(games: OwnedGame[]) {
  const counts: Record<Filter, number> = {
    all: games.length,
    "in-library": 0,
    "not-imported": 0,
    steam: 0,
    psn: 0,
    xbox: 0,
    epicgames: 0,
    nintendo: 0,
  };
  for (const game of games) {
    counts[game.source]++;
    counts[game.isInLibrary ? "in-library" : "not-imported"]++;
  }
  return counts;
}
export function filterAndSort(
  games: OwnedGame[],
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
          comparison = STORE_NAMES[a.source].localeCompare(
            STORE_NAMES[b.source],
          );
          break;
        case "year":
          comparison = gameYear(a) - gameYear(b);
          break;
        case "in-library":
          comparison = Number(a.isInLibrary) - Number(b.isInLibrary);
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

export async function importOwnedGames(
  games: OwnedGame[],
  collectionIds: string[],
  send: (
    source: Source,
    body: ImporterBatchImportRequestDto,
  ) => Promise<ImporterBatchImportResponseDto>,
  completed: (source: Source) => void,
) {
  let imported = 0;
  for (const source of SOURCES) {
    const externalGameIds = [
      ...new Set(
        games
          .filter((game) => game.source === source && !game.isInLibrary)
          .map((game) => game.id),
      ),
    ];
    if (!externalGameIds.length) continue;
    const result = await send(source, { externalGameIds, collectionIds });
    imported += result.importedCount;
    completed(source);
  }
  return imported;
}
