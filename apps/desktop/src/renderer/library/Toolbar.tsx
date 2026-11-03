import { Button, CloseButton, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export function Toolbar({
  text,
  selectedCount,
  view,
  canImport,
  importing,
  onText,
  onEscape,
  onView,
  onImport,
}: {
  text: string;
  selectedCount: number;
  view: "grid" | "list";
  canImport: boolean;
  importing: boolean;
  onText: (text: string) => void;
  onEscape: () => void;
  onView: (view: "grid" | "list") => void;
  onImport: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-sm p-sm">
      <TextInput
        className="min-w-40 max-w-sm flex-1"
        aria-label="Filter games by name"
        placeholder="Type to filter games…"
        leftSection={<IconSearch size={16} />}
        value={text}
        onChange={(event) => onText(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onText("");
            onEscape();
          }
        }}
        rightSection={
          text ? (
            <CloseButton
              size="sm"
              aria-label="Clear filter"
              onClick={() => onText("")}
            />
          ) : undefined
        }
      />
      <Text size="sm" className="whitespace-nowrap text-dimmed-1">
        {selectedCount} selected
      </Text>
      <div className="ml-auto flex items-center gap-xs">
        {(["grid", "list"] as const).map((value) => (
          <Button
            key={value}
            size="compact-sm"
            radius="xl"
            variant={view === value ? "filled" : "default"}
            aria-pressed={view === value}
            onClick={() => onView(value)}
          >
            {value === "grid" ? "Grid" : "List"}
          </Button>
        ))}
        <Button disabled={!canImport} loading={importing} onClick={onImport}>
          Import
        </Button>
      </div>
    </div>
  );
}
