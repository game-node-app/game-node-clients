import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconMoodEmpty,
} from "@tabler/icons-react";
import { useLocalStorage, useResizeObserver } from "@mantine/hooks";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { MenuAction } from "../../shared/bridge";
import { TopBar, type TopBarUser } from "../components/TopBar";
import { StateMessage } from "../components/StateMessage";
import { DetailPane } from "./DetailPane";
import { GameCard } from "./GameCard";
import { GameRow, LIST_COLUMNS } from "./GameRow";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { Toolbar } from "./Toolbar";
import { defaultLayout, readLayout } from "./layout";
import {
  filterAndSort,
  filterCounts,
  gameName,
  initialSelection,
  selectionReducer,
  type LibraryGame,
  type SortColumn,
} from "./model";

export function Library({
  games,
  user,
}: {
  games: LibraryGame[];
  user: TopBarUser;
}) {
  const online = useSyncExternalStore(subscribeNetwork, () => navigator.onLine);
  const [layout, setLayout] = useLocalStorage({
    key: "gamenode-layout",
    defaultValue: defaultLayout,
    deserialize: readLayout,
  });
  const [text, setText] = useState("");
  const [selection, dispatch] = useReducer(selectionReducer, initialSelection);
  const [detailKey, setDetailKey] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const filter = games.some((game) => game.source === layout.filter)
    ? layout.filter
    : "all";
  const sources = useMemo(
    () => [...new Set(games.map((game) => game.source))],
    [games],
  );
  const visible = useMemo(
    () => filterAndSort(games, filter, text, layout.sort),
    [games, filter, layout.sort, text],
  );
  const ids = useMemo(() => visible.map((game) => game.key), [visible]);
  const counts = useMemo(() => filterCounts(games), [games]);
  const [viewportRef, rect] = useResizeObserver();
  const scrollRef = useRef<HTMLDivElement>(null);
  const columns =
    layout.view === "grid"
      ? Math.max(1, Math.floor((rect.width - 16) / 168))
      : 1;
  // Cover ratio 264:354 plus name and store lines, so rows never clip at any width.
  const cardWidth = (rect.width - 16 - (columns - 1) * 8) / columns;
  const gridRow = Math.ceil((cardWidth - 16) * (354 / 264) + 65 + 8);
  const virtual = useVirtualizer({
    count: Math.ceil(visible.length / columns),
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (layout.view === "grid" ? gridRow : 48),
    overscan: 4,
  });
  const detail = games.find((game) => game.key === detailKey);
  const selectedGames = visible.filter((game) =>
    selection.selected.has(game.key),
  );

  useEffect(() => {
    dispatch({ type: "prune", ids });
  }, [ids]);
  useEffect(() => {
    virtual.measure();
  }, [virtual, columns, layout.view, gridRow]);
  function runAction(action: MenuAction, gameIds?: string[]) {
    setActionError(undefined);
    const games = gameIds
      ? visible.filter((game) => gameIds.includes(game.key))
      : selectedGames;
    if (action === "grid" || action === "list")
      setLayout({ ...layout, view: action });
    if (action === "select-all") {
      dispatch({ type: "all", ids });
      setDetailKey(selection.focused || ids[0]);
      scrollRef.current?.focus();
    }
    if (action === "copy" && games.length)
      void navigator.clipboard
        .writeText(games.map(gameName).join("\n"))
        .catch(() => setActionError("Could not copy game names"));
    if (action === "open")
      for (const game of games)
        if (game.gameId)
          void window.gamenode
            .openExternal(`https://gamenode.app/game/${game.gameId}`)
            .catch(() => setActionError("Could not open game page"));
  }
  useEffect(() =>
    window.gamenode.onMenuAction((action, gameIds) => {
      // Native accelerators must leave text editing shortcuts with the focused control.
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        if (action === "select-all") document.activeElement.select();
        return;
      }
      runAction(action, gameIds);
    }),
  );
  function choose(game: LibraryGame, event: MouseEvent) {
    dispatch({
      type: event.shiftKey
        ? "range"
        : event.ctrlKey || event.metaKey
          ? "toggle"
          : "select",
      id: game.key,
      ids,
    });
    setDetailKey(game.key);
    scrollRef.current?.focus();
  }
  function keyboard(event: KeyboardEvent) {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    )
      return;
    const current = Math.max(0, ids.indexOf(selection.focused || ""));
    const delta = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -columns,
      ArrowDown: columns,
    }[event.key];
    if (delta !== undefined && ids.length) {
      event.preventDefault();
      const index = Math.max(0, Math.min(ids.length - 1, current + delta));
      dispatch({
        type: event.shiftKey ? "range" : "focus",
        id: ids[index],
        ids,
      });
      virtual.scrollToIndex(Math.floor(index / columns));
    } else if (event.key === "Enter") {
      event.preventDefault();
      setDetailKey(ids[current]);
    } else if (event.key === " " && ids.length) {
      event.preventDefault();
      dispatch({ type: "toggle", id: ids[current], ids });
      setDetailKey(ids[current]);
    } else if (
      (event.ctrlKey || event.metaKey) &&
      ["a", "1", "2"].includes(event.key.toLowerCase())
    ) {
      event.preventDefault();
      runAction(
        event.key === "1" ? "grid" : event.key === "2" ? "list" : "select-all",
      );
    } else if (event.key === "Escape") {
      event.preventDefault();
      setText("");
    } else if (event.key === "Backspace") {
      event.preventDefault();
      setText(text.slice(0, -1));
    } else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      setText(text + event.key);
    }
  }
  function sort(column: SortColumn) {
    setLayout({
      ...layout,
      sort: {
        column,
        direction:
          layout.sort.column === column && layout.sort.direction === "asc"
            ? "desc"
            : "asc",
      },
    });
  }
  return (
    <div className="flex h-full flex-col">
      <TopBar user={user} onError={setActionError} />
      <StatusBar
        offline={!online}
        error={actionError}
        onDismiss={() => setActionError(undefined)}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          width={layout.sidebar}
          filter={filter}
          sources={sources}
          counts={counts}
          onFilter={(filter) => setLayout({ ...layout, filter })}
        />
        <Splitter
          label="Sidebar width"
          value={layout.sidebar}
          min={150}
          max={300}
          onChange={(sidebar) => setLayout({ ...layout, sidebar })}
        />
        <main className="flex min-w-[160px] flex-1 flex-col" ref={viewportRef}>
          <Toolbar
            text={text}
            selectedCount={selectedGames.length}
            view={layout.view}
            onText={setText}
            onEscape={() => scrollRef.current?.focus()}
            onView={runAction}
          />
          {!games.length ? (
            <StateMessage
              icon={IconMoodEmpty}
              title="No games yet"
              text="Games installed on this PC will appear here."
            />
          ) : (
            <>
              {layout.view === "list" && (
                <div
                  className={`list-columns grid h-10 shrink-0 items-center gap-sm border-b border-paper-4 pl-md pr-[26px] ${LIST_COLUMNS}`}
                  role="group"
                  aria-label="Sort games"
                >
                  {(
                    [
                      ["name", "Name"],
                      ["store", "Source"],
                      ["year", "Year"],
                    ] as [SortColumn, string][]
                  ).map(([column, label]) => {
                    const active = layout.sort.column === column;
                    const Chevron =
                      layout.sort.direction === "asc"
                        ? IconChevronUp
                        : IconChevronDown;
                    return (
                      <div key={column}>
                        <button
                          type="button"
                          aria-label={`Sort by ${label}${active ? `, ${layout.sort.direction === "asc" ? "ascending" : "descending"}` : ""}`}
                          aria-pressed={active}
                          className={`flex items-center gap-1 text-xs font-bold uppercase text-dimmed-1 hover:text-[#D9D9D9] ${column === "name" ? "pl-11" : ""}`}
                          onClick={() => sort(column)}
                        >
                          {label}
                          {active && <Chevron size={14} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div
                className="min-h-0 flex-1 overflow-auto outline-none"
                ref={scrollRef}
                role="listbox"
                aria-label="Games"
                aria-multiselectable="true"
                aria-activedescendant={
                  selection.focused ? `game-${selection.focused}` : undefined
                }
                tabIndex={0}
                onFocus={() => {
                  if (!selection.focused && ids.length)
                    dispatch({ type: "focus", id: ids[0], ids });
                }}
                onKeyDown={keyboard}
              >
                {!visible.length && (
                  <StateMessage
                    icon={IconMoodEmpty}
                    title="No games match this filter"
                    text="Try another filter or clear the search."
                  />
                )}
                <div
                  style={{
                    height: virtual.getTotalSize(),
                    position: "relative",
                  }}
                >
                  {virtual.getVirtualItems().map((row) => (
                    <div
                      key={row.key}
                      className={
                        layout.view === "grid" ? "grid gap-x-2 px-2" : undefined
                      }
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: row.size,
                        transform: `translateY(${row.start}px)`,
                        ...(layout.view === "grid"
                          ? {
                              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                              alignContent: "start",
                            }
                          : {}),
                      }}
                    >
                      {visible
                        .slice(row.index * columns, (row.index + 1) * columns)
                        .map((game, index) => {
                          const Item =
                            layout.view === "grid" ? GameCard : GameRow;
                          return (
                            <Item
                              key={game.key}
                              game={game}
                              selected={selection.selected.has(game.key)}
                              focused={selection.focused === game.key}
                              id={`game-${game.key}`}
                              role="option"
                              aria-posinset={row.index * columns + index + 1}
                              aria-setsize={visible.length}
                              aria-selected={selection.selected.has(game.key)}
                              aria-label={`${gameName(game)}, ${game.source}`}
                              onClick={(event) => choose(game, event)}
                              onDoubleClick={() => setDetailKey(game.key)}
                              onContextMenu={(event) => {
                                event.preventDefault();
                                scrollRef.current?.focus();
                                const selected = selection.selected.has(
                                  game.key,
                                )
                                  ? [...selection.selected]
                                  : [game.key];
                                if (!selection.selected.has(game.key))
                                  dispatch({
                                    type: "select",
                                    id: game.key,
                                    ids,
                                  });
                                setDetailKey(game.key);
                                void window.gamenode
                                  .showGameContextMenu(selected)
                                  .catch(() =>
                                    setActionError("Could not show game menu"),
                                  );
                              }}
                            />
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="truncate px-md py-xs text-xs text-dimmed-1">
                {visible.length} games
              </div>
            </>
          )}
        </main>
        {detail && (
          <>
            <Splitter
              label="Detail pane width"
              value={layout.detail}
              min={220}
              max={450}
              reverse
              onChange={(width) => setLayout({ ...layout, detail: width })}
            />
            <DetailPane
              game={detail}
              width={layout.detail}
              onClose={() => setDetailKey(undefined)}
            />
          </>
        )}
      </div>
    </div>
  );
}

function Splitter({
  label,
  value,
  min,
  max,
  reverse,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  reverse?: boolean;
  onChange: (width: number) => void;
}) {
  const drag = useRef<{ x: number; value: number } | undefined>(undefined);
  const update = (width: number) =>
    onChange(Math.max(min, Math.min(max, width)));
  return (
    <div
      className="w-2 shrink-0 cursor-col-resize touch-none bg-paper-4 bg-clip-content px-[3.5px] outline-none hover:bg-brand focus-visible:bg-brand"
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation="vertical"
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      onKeyDown={(event) => {
        if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
          event.preventDefault();
          update(
            value +
              (event.key === "ArrowRight" ? 10 : -10) * (reverse ? -1 : 1),
          );
        }
      }}
      onPointerDown={(event) => {
        drag.current = { x: event.clientX, value };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (drag.current)
          update(
            drag.current.value +
              (event.clientX - drag.current.x) * (reverse ? -1 : 1),
          );
      }}
      onPointerUp={(event) => {
        drag.current = undefined;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        drag.current = undefined;
      }}
    />
  );
}

function subscribeNetwork(listener: () => void) {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
}
