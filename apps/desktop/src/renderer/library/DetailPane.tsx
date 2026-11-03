import { ActionIcon, Badge, Button, Text, Title } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { Cover } from "../components/Cover";
import { STORE_NAMES, gameName, gameYear, type OwnedGame } from "./model";

export function DetailPane({
  game,
  width,
  offline,
  importing,
  onImport,
  onClose,
}: {
  game: OwnedGame;
  width: number;
  offline: boolean;
  importing: boolean;
  onImport: () => void;
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
        {STORE_NAMES[game.source]} · {gameYear(game) || "Year unknown"}
      </Text>
      <Text size="sm">
        Matched GameNode game:{" "}
        {game.game?.name || (game.gameId ? `#${game.gameId}` : "No match yet")}
      </Text>
      <Badge
        className="self-start"
        variant={game.isInLibrary ? "filled" : "default"}
      >
        {game.isInLibrary ? "In GameNode library" : "Not imported"}
      </Badge>
      {!game.isInLibrary && (
        <Button disabled={offline} loading={importing} onClick={onImport}>
          Import
        </Button>
      )}
    </aside>
  );
}
