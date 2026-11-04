import { ActionIcon, Text, Title } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { Cover } from "../components/Cover";
import { gameName, gameYear, type LibraryGame } from "./model";

export function DetailPane({
  game,
  width,
  onClose,
}: {
  game: LibraryGame;
  width: number;
  onClose: () => void;
}) {
  return (
    <aside
      className="flex shrink-0 flex-col gap-sm overflow-auto bg-paper-7 p-md"
      style={{ width, maxWidth: "40vw" }}
      aria-label="Game details"
    >
      <ActionIcon
        variant="subtle"
        color="gray"
        className="self-end"
        aria-label="Close details"
        onClick={onClose}
      >
        <IconX size={16} />
      </ActionIcon>
      <Cover game={game} alt={`${gameName(game)} cover`} />
      <Title order={2} size="h3">
        {gameName(game)}
      </Title>
      <Text size="sm" className="text-dimmed-1">
        {game.source} · {gameYear(game) || "Year unknown"}
      </Text>
      <Text size="sm">
        Matched GameNode game:{" "}
        {game.gameId ? `#${game.gameId}` : "No match yet"}
      </Text>
    </aside>
  );
}
