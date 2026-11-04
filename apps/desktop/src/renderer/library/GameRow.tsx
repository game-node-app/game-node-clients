import type { HTMLAttributes } from "react";
import { Text } from "@mantine/core";
import { Cover } from "../components/Cover";
import { gameName, gameYear, type LibraryGame } from "./model";

export const LIST_COLUMNS = "grid-cols-[minmax(100px,1fr)_120px_70px]";

export function GameRow({
  game,
  selected,
  focused,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  game: LibraryGame;
  selected: boolean;
  focused: boolean;
}) {
  return (
    <div
      {...props}
      className={`grid h-12 cursor-default select-none items-center gap-sm px-md hover:bg-paper-4 ${LIST_COLUMNS} ${selected ? "bg-paper-1" : ""} ${focused ? "ring-2 ring-inset ring-[#D9D9D9]" : ""}`}
    >
      <div className="flex min-w-0 items-center gap-sm">
        <Cover game={game} small className="w-8 shrink-0" />
        <Text truncate size="sm">
          {gameName(game)}
        </Text>
      </div>
      <Text size="sm">{game.source}</Text>
      <Text size="sm">{gameYear(game) || "—"}</Text>
    </div>
  );
}
