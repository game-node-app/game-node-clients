import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import {
  Alert,
  Badge,
  Button,
  Group,
  Image,
  Loader,
  Modal,
  MultiSelect,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useLocalStorage, useResizeObserver } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ImporterService } from "@repo/wrapper/server";
import { useUserLibrary } from "@repo/ui/library";
import type { MenuAction } from "../../shared/bridge";
import { defaultLayout, readLayout } from "./layout";
import { useOwnedLibrary } from "./useOwnedLibrary";
import {
  STORE_NAMES,
  filterAndSort,
  filterCounts,
  gameName,
  gameYear,
  gameCover,
  importOwnedGames,
  initialSelection,
  selectionReducer,
  type OwnedGame,
  type SortColumn,
  type Filter,
} from "./model";

export function Library({ userId }: { userId: string }) {
  const library = useOwnedLibrary();
  const client = useQueryClient();
  const [layout, setLayout] = useLocalStorage({
    key: "gamenode-layout",
    defaultValue: defaultLayout,
    deserialize: readLayout,
  });
  const [text, setText] = useState("");
  const [selection, dispatch] = useReducer(selectionReducer, initialSelection);
  const [detailKey, setDetailKey] = useState<string>();
  const [collectionGames, setCollectionGames] = useState<OwnedGame[] | null>(
    null,
  );
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const collections = useUserLibrary(collectionGames ? userId : undefined);
  const visible = useMemo(
    () => filterAndSort(library.games, layout.filter, text, layout.sort),
    [library.games, layout.filter, layout.sort, text],
  );
  const ids = useMemo(() => visible.map((game) => game.key), [visible]);
  const counts = useMemo(() => filterCounts(library.games), [library.games]);
  const [viewportRef, rect] = useResizeObserver();
  const scrollRef = useRef<HTMLDivElement>(null);
  const columns =
    layout.view === "grid" ? Math.max(1, Math.floor(rect.width / 160)) : 1;
  const virtual = useVirtualizer({
    count: Math.ceil(visible.length / columns),
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (layout.view === "grid" ? 290 : 48),
    overscan: 4,
  });
  const detail = library.games.find((game) => game.key === detailKey);
  const selectedGames = visible.filter((game) =>
    selection.selected.has(game.key),
  );

  useEffect(() => {
    dispatch({ type: "prune", ids });
  }, [ids]);
  useEffect(() => {
    virtual.measure();
  }, [virtual, columns, layout.view]);
  const importing = useMutation({
    mutationFn: ({
      games,
      collectionIds,
    }: {
      games: OwnedGame[];
      collectionIds: string[];
    }) => {
      if (library.offline) throw new Error("Imports are unavailable offline");
      return importOwnedGames(
        games,
        collectionIds,
        (source, body) =>
          ImporterService.importerControllerImportBatchV1(source, body),
        (source) => {
          void client.invalidateQueries({
            queryKey: ["owned-library", source],
          });
          void client.invalidateQueries({ queryKey: ["connections", "own"] });
          void client.invalidateQueries({ queryKey: ["library", userId] });
          void client.invalidateQueries({ queryKey: ["collection-entries"] });
        },
      );
    },
    onSuccess(count) {
      setCollectionGames(null);
      const message = `${count} game${count === 1 ? "" : "s"} imported into GameNode`;
      setMessage(message);
      if (Notification.permission === "granted")
        new Notification("GameNode", { body: message });
      else
        void Notification.requestPermission().then((permission) => {
          if (permission === "granted")
            new Notification("GameNode", { body: message });
        });
    },
  });
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
    if (
      action === "import" &&
      !library.offline &&
      !importing.isPending &&
      games.some((game) => !game.isInLibrary)
    )
      importing.mutate({ games, collectionIds: [] });
    if (
      action === "import-collection" &&
      !library.offline &&
      games.some((game) => !game.isInLibrary)
    ) {
      setCollectionIds([]);
      setCollectionGames(games);
    }
    if (action === "copy" && games.length)
      void navigator.clipboard
        .writeText(games.map(gameName).join("\n"))
        .catch(() => setActionError("Could not copy game names"));
    if (action === "open")
      for (const game of games)
        if (game.gameId || game.game?.id)
          void window.gamenode
            .openExternal(
              `https://gamenode.app/game/${game.gameId || game.game.id}`,
            )
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
  function choose(game: OwnedGame, event: MouseEvent) {
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
      ["a", "i", "1", "2"].includes(event.key.toLowerCase())
    ) {
      event.preventDefault();
      runAction(
        event.key === "1"
          ? "grid"
          : event.key === "2"
            ? "list"
            : event.key.toLowerCase() === "a"
              ? "select-all"
              : "import",
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
  const canImport =
    !library.offline &&
    !importing.isPending &&
    selectedGames.some((game) => !game.isInLibrary);
  const filters: [Filter, string][] = [
    ["all", "All games"],
    ...library.sources.map(
      (source) => [source, STORE_NAMES[source]] as [Filter, string],
    ),
    ["in-library", "In GameNode"],
    ["not-imported", "Not imported yet"],
  ];
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
    <div className="library">
      <header className="toolbar">
        <Text fw={700} c="brand">
          GameNode
        </Text>
        <Title order={1} size="h3">
          Owned library
        </Title>
        <Text size="sm" c="dimmed">
          {selectedGames.length} selected
        </Text>
        <Group ml="auto" gap="xs">
          <Button
            variant="light"
            disabled={!canImport}
            loading={importing.isPending}
            onClick={() => runAction("import")}
          >
            Import
          </Button>
          <Button
            variant="default"
            aria-pressed={layout.view === "grid"}
            onClick={() => runAction("grid")}
          >
            Grid
          </Button>
          <Button
            variant="default"
            aria-pressed={layout.view === "list"}
            onClick={() => runAction("list")}
          >
            List
          </Button>
          <Button
            variant="subtle"
            color="gray"
            onClick={() =>
              void window.gamenode
                .signOut()
                .catch(() => setActionError("Could not clear saved session"))
            }
          >
            Sign out
          </Button>
        </Group>
      </header>
      {library.offline && (
        <Alert color="yellow" title="Offline · read-only">
          Last synced:{" "}
          {library.lastSynced
            ? new Date(library.lastSynced).toLocaleString()
            : "No cached games"}
        </Alert>
      )}
      {(importing.error || actionError) && (
        <Alert color="red" title="Action failed">
          {actionError ||
            (importing.error instanceof Error
              ? importing.error.message
              : "Could not import games")}
        </Alert>
      )}
      {message && (
        <Alert withCloseButton onClose={() => setMessage(undefined)}>
          {message}
        </Alert>
      )}
      <div className="panes">
        <aside
          className="sidebar"
          style={{ width: layout.sidebar }}
          aria-label="Library filters"
        >
          <Text c="dimmed" size="xs" fw={700} mb="sm">
            YOUR LIBRARY
          </Text>
          {filters.map(([filter, label]) => {
            const index = library.sources.indexOf(
              filter as (typeof library.sources)[number],
            );
            const query = library.queries[index];
            return (
              <div key={filter}>
                <Button
                  fullWidth
                  justify="space-between"
                  variant={layout.filter === filter ? "light" : "subtle"}
                  color={layout.filter === filter ? undefined : "gray"}
                  onClick={() => {
                    setLayout({ ...layout, filter });
                  }}
                  rightSection={
                    <Badge size="sm" variant="light" color="gray">
                      {counts[filter]}
                    </Badge>
                  }
                >
                  {label}
                </Button>
                {query?.isError && (
                  <Button
                    size="compact-xs"
                    color="red"
                    variant="subtle"
                    onClick={() => void query.refetch()}
                  >
                    Load failed · Retry
                  </Button>
                )}
                {query?.isFetching && (
                  <Text size="xs" c="dimmed">
                    Syncing…
                  </Text>
                )}
              </div>
            );
          })}
          <Button
            mt="lg"
            fullWidth
            variant="default"
            onClick={() =>
              void window.gamenode
                .openExternal("https://gamenode.app/preferences/connections")
                .catch(() => setActionError("Could not open connections"))
            }
          >
            Manage stores
          </Button>
        </aside>
        <Splitter
          label="Sidebar width"
          value={layout.sidebar}
          min={150}
          max={300}
          onChange={(sidebar) => setLayout({ ...layout, sidebar })}
        />
        <main className="game-area" ref={viewportRef}>
          <TextInput
            m="sm"
            aria-label="Filter games by name"
            placeholder="Type to filter games…"
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setText("");
                scrollRef.current?.focus();
              }
            }}
            rightSection={
              text ? (
                <button
                  className="clear-search"
                  aria-label="Clear filter"
                  onClick={() => setText("")}
                >
                  ×
                </button>
              ) : undefined
            }
          />
          {library.connections.isPending ? (
            <Stack p="xl" align="center">
              <Loader />
              <Text>Loading linked stores…</Text>
            </Stack>
          ) : library.connections.isError && !library.connections.data ? (
            <Alert color="red" title="Could not load stores">
              <Button onClick={() => void library.connections.refetch()}>
                Retry
              </Button>
            </Alert>
          ) : !library.sources.length ? (
            <Stack p="xl" align="center">
              <Title order={2}>Link your stores</Title>
              <Text c="dimmed">
                Connect a store on GameNode to see the games you own here.
              </Text>
              <Button
                onClick={() =>
                  void window.gamenode
                    .openExternal(
                      "https://gamenode.app/preferences/connections",
                    )
                    .catch(() => setActionError("Could not open connections"))
                }
              >
                Link a store
              </Button>
            </Stack>
          ) : (
            <>
              {layout.view === "list" && (
                <div
                  className="list-columns"
                  role="group"
                  aria-label="Sort games"
                >
                  {(
                    [
                      ["name", "Name"],
                      ["store", "Store"],
                      ["year", "Year"],
                      ["in-library", "In GameNode"],
                    ] as [SortColumn, string][]
                  ).map(([column, label]) => (
                    <div key={column}>
                      <button
                        aria-label={`Sort by ${label}${layout.sort.column === column ? `, ${layout.sort.direction === "asc" ? "ascending" : "descending"}` : ""}`}
                        aria-pressed={layout.sort.column === column}
                        onClick={() => sort(column)}
                      >
                        {label}
                        {layout.sort.column === column
                          ? layout.sort.direction === "asc"
                            ? " ↑"
                            : " ↓"
                          : ""}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div
                className="game-scroll"
                ref={scrollRef}
                role="listbox"
                aria-label="Owned games"
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
                  <Text p="xl" c="dimmed">
                    {library.queries.some((query) => query.isFetching)
                      ? "Loading owned games…"
                      : "No games match this filter."}
                  </Text>
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
                        layout.view === "grid" ? "cover-row" : undefined
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
                            }
                          : {}),
                      }}
                    >
                      {visible
                        .slice(row.index * columns, (row.index + 1) * columns)
                        .map((game, index) => (
                          <div
                            key={game.key}
                            id={`game-${game.key}`}
                            role="option"
                            aria-posinset={row.index * columns + index + 1}
                            aria-setsize={visible.length}
                            aria-selected={selection.selected.has(game.key)}
                            aria-label={`${gameName(game)}, ${STORE_NAMES[game.source]}, ${game.isInLibrary ? "in GameNode" : "not imported"}`}
                            className={`game ${layout.view} ${selection.focused === game.key ? "focused" : ""}`}
                            onClick={(event) => choose(game, event)}
                            onDoubleClick={() => setDetailKey(game.key)}
                            onContextMenu={(event) => {
                              event.preventDefault();
                              scrollRef.current?.focus();
                              const selected = selection.selected.has(game.key)
                                ? [...selection.selected]
                                : [game.key];
                              if (!selection.selected.has(game.key))
                                dispatch({ type: "select", id: game.key, ids });
                              setDetailKey(game.key);
                              void window.gamenode
                                .showGameContextMenu(selected)
                                .catch(() =>
                                  setActionError("Could not show game menu"),
                                );
                            }}
                          >
                            {layout.view === "grid" ? (
                              <>
                                <Image
                                  src={gameCover(game)}
                                  alt=""
                                  h={210}
                                  fit="contain"
                                  fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='210'%3E%3Crect width='160' height='210' fill='%232a2a2a'/%3E%3C/svg%3E"
                                />
                                <Text truncate size="sm" fw={600}>
                                  {gameName(game)}
                                </Text>
                                <Group justify="space-between" gap={2}>
                                  <Text size="xs" c="dimmed">
                                    {STORE_NAMES[game.source]}
                                  </Text>
                                  <Badge
                                    variant="light"
                                    color={game.isInLibrary ? "teal" : "gray"}
                                    size="xs"
                                  >
                                    {game.isInLibrary
                                      ? "In GameNode"
                                      : "Not imported"}
                                  </Badge>
                                </Group>
                              </>
                            ) : (
                              <>
                                <Text truncate size="sm">
                                  {gameName(game)}
                                </Text>
                                <Text size="sm">
                                  {STORE_NAMES[game.source]}
                                </Text>
                                <Text size="sm">{gameYear(game) || "—"}</Text>
                                <Text size="sm">
                                  {game.isInLibrary ? "Yes" : "No"}
                                </Text>
                              </>
                            )}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
              <Text size="xs" c="dimmed" p="xs">
                {visible.length} games
                {library.lastSynced
                  ? ` · Last synced ${new Date(library.lastSynced).toLocaleString()}`
                  : ""}
              </Text>
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
            <aside
              className="detail"
              style={{ width: layout.detail }}
              aria-label="Game details"
            >
              <Stack>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="gray"
                  onClick={() => setDetailKey(undefined)}
                >
                  Close details
                </Button>
                {gameCover(detail) && (
                  <Image
                    src={gameCover(detail)}
                    alt={`${gameName(detail)} cover`}
                    mah={300}
                    fit="contain"
                  />
                )}
                <Title order={2} size="h3">
                  {gameName(detail)}
                </Title>
                <Text>
                  {STORE_NAMES[detail.source]} ·{" "}
                  {gameYear(detail) || "Year unknown"}
                </Text>
                <Text size="sm">
                  Matched GameNode game:{" "}
                  {detail.game?.name ||
                    (detail.gameId ? `#${detail.gameId}` : "No match yet")}
                </Text>
                <Badge
                  variant="light"
                  color={detail.isInLibrary ? "teal" : "gray"}
                >
                  {detail.isInLibrary ? "In GameNode library" : "Not imported"}
                </Badge>
                {!detail.isInLibrary && (
                  <Button
                    disabled={library.offline}
                    loading={importing.isPending}
                    onClick={() =>
                      importing.mutate({ games: [detail], collectionIds: [] })
                    }
                  >
                    Import
                  </Button>
                )}
              </Stack>
            </aside>
          </>
        )}
      </div>
      <Modal
        opened={!!collectionGames}
        onClose={() => {
          if (!importing.isPending) setCollectionGames(null);
        }}
        title="Import into collections"
      >
        <Stack>
          {collections.isPending ? (
            <Loader />
          ) : collections.isError ? (
            <Alert color="red">
              Could not load collections.{" "}
              <Button onClick={() => void collections.refetch()}>Retry</Button>
            </Alert>
          ) : (
            <MultiSelect
              label="Collections"
              data={
                collections.data?.collections.map((collection) => ({
                  value: collection.id,
                  label: collection.name,
                })) || []
              }
              value={collectionIds}
              onChange={setCollectionIds}
              searchable
            />
          )}
          {importing.error && (
            <Alert color="red">Import failed. Please try again.</Alert>
          )}
          <Button
            disabled={!collectionIds.length || library.offline}
            loading={importing.isPending}
            onClick={() => {
              if (collectionGames)
                importing.mutate({ games: collectionGames, collectionIds });
            }}
          >
            Import selected games
          </Button>
        </Stack>
      </Modal>
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
      className="splitter"
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
