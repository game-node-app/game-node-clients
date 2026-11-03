import type { HTMLAttributes } from "react";
import { Badge, Text } from "@mantine/core";
import { Cover } from "../components/Cover";
import { STORE_NAMES, gameName, type OwnedGame } from "./model";

export function GameCard({
  game,
  selected,
  focused,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  game: OwnedGame;
  selected: boolean;
  focused: boolean;
}) {
  return (
    <div
      {...props}
      className={`flex min-w-0 cursor-default select-none flex-col gap-1 rounded-sm p-2 hover:bg-paper-4 ${focused ? "ring-2 ring-[#D9D9D9]" : ""}`}
    >
      <div className="relative">
        <Cover
          game={game}
          className={`rounded-sm ${selected ? "outline outline-2 outline-brand" : ""}`}
        />
        {game.isInLibrary && (
          <Badge size="xs" className="absolute left-1 top-1">
            In GameNode
          </Badge>
        )}
      </div>
      <Text truncate size="sm" fw={500}>
        {gameName(game)}
      </Text>
      <Text truncate size="xs" className="text-dimmed-1">
        {STORE_NAMES[game.source]}
      </Text>
    </div>
  );
}
