import type { ReactNode } from "react";
import { Loader, Text, Tooltip } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { STORE_NAMES, type Filter, type Source } from "./model";

interface StoreQuery {
  isError: boolean;
  isFetching: boolean;
  refetch: () => unknown;
}

export function Sidebar({
  width,
  filter,
  sources,
  queries,
  counts,
  onFilter,
}: {
  width: number;
  filter: Filter;
  sources: readonly Source[];
  queries: StoreQuery[];
  counts: Record<Filter, number>;
  onFilter: (filter: Filter) => void;
}) {
  const item = (value: Filter, label: string, status?: ReactNode) => (
    <div key={value} className="flex items-center gap-xs">
      <button
        type="button"
        aria-current={filter === value}
        onClick={() => onFilter(value)}
        className={`flex min-w-0 flex-1 items-center justify-between gap-xs rounded-sm px-sm py-xs text-left text-sm hover:bg-paper-4 ${filter === value ? "bg-paper-1" : ""}`}
      >
        <span className="truncate">{label}</span>
        <span className="text-xs text-dimmed-1">{counts[value]}</span>
      </button>
      {status}
    </div>
  );
  return (
    <aside
      className="flex shrink-0 flex-col gap-xs overflow-auto bg-paper-7 p-sm"
      style={{ width }}
      aria-label="Library filters"
    >
      <Text size="xs" fw={700} className="px-sm uppercase text-dimmed-1">
        Library
      </Text>
      {item("all", "All games")}
      {item("in-library", "In GameNode")}
      {item("not-imported", "Not imported yet")}
      <Text size="xs" fw={700} className="mt-md px-sm uppercase text-dimmed-1">
        Stores
      </Text>
      {sources.map((source, index) => {
        const query = queries[index];
        return item(
          source,
          STORE_NAMES[source],
          query?.isError ? (
            <Tooltip label="Load failed · Retry">
              <button
                type="button"
                aria-label="Load failed · Retry"
                className="flex size-6 shrink-0 items-center justify-center rounded-sm text-danger hover:bg-paper-4"
                onClick={() => void query.refetch()}
              >
                <IconAlertTriangle size={16} />
              </button>
            </Tooltip>
          ) : query?.isFetching ? (
            <Loader size={14} aria-label="Syncing" />
          ) : undefined,
        );
      })}
    </aside>
  );
}
