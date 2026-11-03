import { useQueries } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { useOwnUserConnections } from "@repo/ui/connections";
import { ImporterService } from "@repo/wrapper/server";
import { SOURCES, loadOwnedSource, mergeOwnedSources } from "./model";

export function useOwnedLibrary() {
  const online = useSyncExternalStore(subscribeNetwork, () => navigator.onLine);
  const connections = useOwnUserConnections();
  const sources = SOURCES.filter((source) =>
    connections.data?.some((connection) => connection.type === source),
  );
  const { queries, games } = useQueries({
    queries: sources.map((source) => ({
      queryKey: ["owned-library", source],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        loadOwnedSource(
          source,
          (source, exclude, limit, offset) => {
            const request =
              ImporterService.importerControllerFindUnprocessedEntriesV1(
                source,
                exclude,
                limit,
                offset,
              );
            const cancel = () => request.cancel();
            signal.addEventListener("abort", cancel, { once: true });
            return request.finally(() =>
              signal.removeEventListener("abort", cancel),
            );
          },
          signal,
        ),
      networkMode: "always" as const,
    })),
    combine: (queries) => ({
      queries,
      games: mergeOwnedSources(queries.map((query) => query.data)),
    }),
  });
  const offline =
    !online ||
    (queries.length > 0 &&
      queries.every((query) => query.isError && isNetworkError(query.error))) ||
    (connections.isError && isNetworkError(connections.error));
  const lastSynced = Math.min(
    ...queries.map((query) => query.dataUpdatedAt).filter(Boolean),
  );
  return {
    connections,
    sources,
    queries,
    games,
    offline,
    lastSynced: Number.isFinite(lastSynced) ? lastSynced : undefined,
  };
}
function subscribeNetwork(listener: () => void) {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
}
function isNetworkError(error: unknown) {
  return (
    error instanceof TypeError ||
    (error instanceof Error &&
      /network|fetch|offline|connection/i.test(error.message))
  );
}
