import { Text } from "@mantine/core";
import type { Filter } from "./model";

export function Sidebar({
  width,
  filter,
  sources,
  counts,
  onFilter,
}: {
  width: number;
  filter: Filter;
  sources: readonly string[];
  counts: Record<Filter, number>;
  onFilter: (filter: Filter) => void;
}) {
  const item = (value: Filter, label: string) => (
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
      <Text size="xs" fw={700} className="mt-md px-sm uppercase text-dimmed-1">
        Sources
      </Text>
      {sources.map((source) => item(source, source))}
    </aside>
  );
}
