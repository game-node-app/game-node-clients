import type { AwardsNomineeStatus } from "#@/components/awards/types";
import {
  formatPlaytimeHours,
  formatRatingCompact,
  toPlaytimeHours,
  useFormatLocale,
} from "#@/components/events/util/format";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import type { TGameOrSearchGame } from "#@/components/game/util/types";
import { cn } from "#@/util";
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconX } from "@tabler/icons-react";
import type { KeyboardEvent, ReactNode } from "react";
import { AwardsGameCover } from "./AwardsGameCover";

export interface AwardsNomineeCardProps {
  gameId: number;
  /** Hydrated game (name and cover). */
  game?: TGameOrSearchGame | null;
  /** The viewer's relation to the game from the ballot. */
  status?: AwardsNomineeStatus | null;
  playtimeSeconds?: number | null;
  /** Server rating on the 0–5 scale. */
  rating?: number | null;
  /** Optional "Developer · PS5, PC" line, derived by the screen. */
  metadata?: string | null;
  /** Selected state of the card (the viewer's vote or one of their picks). */
  selected?: boolean;
  /** Replaces the default "Seu voto" badge. */
  selectedLabel?: ReactNode;
  onSelect?: (gameId: number) => void;
  /** Renders a remove action, used by the nominations screen. */
  onRemove?: (gameId: number) => void;
  removeLabel?: string;
  disabled?: boolean;
  className?: string;
}

const STATUS_COLORS: Record<AwardsNomineeStatus, "teal" | "brand" | "gray"> = {
  played: "teal",
  planned: "brand",
  not_played: "gray",
};

/**
 * Nominee card from the design component `5408:716`: cover, name, developer and
 * platforms, the viewer's play status as a chip and, when selected, "Seu voto".
 */
const AwardsNomineeCard = ({
  gameId,
  game,
  status = null,
  playtimeSeconds,
  rating,
  metadata,
  selected = false,
  selectedLabel,
  onSelect,
  onRemove,
  removeLabel,
  disabled = false,
  className,
}: AwardsNomineeCardProps) => {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const compact = useOnMobile();

  let statusText: string | null = null;

  if (status === "played") {
    const roundedHours = toPlaytimeHours(playtimeSeconds);
    const hours =
      roundedHours != null && roundedHours > 0
        ? formatPlaytimeHours(playtimeSeconds, locale)
        : null;
    const ratingText = formatRatingCompact(rating, locale);

    if (hours && ratingText) {
      statusText = t("awards.shared.nominee.playedHoursRating", {
        hours,
        rating: ratingText,
      });
    } else if (hours) {
      statusText = t("awards.shared.nominee.playedHours", { hours });
    } else if (ratingText) {
      statusText = t("awards.shared.nominee.playedRating", {
        rating: ratingText,
      });
    } else {
      statusText = t("awards.shared.nominee.played");
    }
  } else if (status === "planned") {
    statusText = compact
      ? t("awards.shared.nominee.plannedCompact")
      : t("awards.shared.nominee.planned");
  } else if (status === "not_played") {
    statusText = compact
      ? t("awards.shared.nominee.notPlayedCompact")
      : t("awards.shared.nominee.notPlayed");
  }

  const statusColor = status ? STATUS_COLORS[status] : null;
  const isInteractive = !!onSelect && !disabled;

  const select = () => {
    if (!isInteractive) {
      return;
    }
    onSelect?.(gameId);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    select();
  };

  return (
    <Paper
      data-awards-nominee-card
      data-game-id={gameId}
      data-status={status ?? "none"}
      data-selected={selected ? "true" : "false"}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? selected : undefined}
      onClick={isInteractive ? select : undefined}
      onKeyDown={isInteractive ? onKeyDown : undefined}
      className={cn(
        "w-full border bg-paper-2 p-3",
        selected ? "border-brand" : "border-paper-4",
        isInteractive && "cursor-pointer",
        disabled && "opacity-60",
        className,
      )}
    >
      <Group align={"flex-start"} wrap={"nowrap"} gap={"sm"}>
        <Box className={"w-16 shrink-0"}>
          <AwardsGameCover game={game} />
        </Box>
        <Stack gap={4} className={"min-w-0 flex-1"}>
          <Text fw={600} className={"truncate"}>
            {game?.name}
          </Text>
          {metadata && (
            <Text size={"xs"} c={"dimmed"} className={"truncate"}>
              {metadata}
            </Text>
          )}
          <Group gap={6} wrap={"wrap"}>
            {statusText && status && statusColor && (
              <Badge
                data-awards-chip={status}
                data-color={statusColor}
                variant={"light"}
                color={statusColor}
                size={"sm"}
                radius={"sm"}
                tt={"none"}
              >
                {statusText}
              </Badge>
            )}
            {selected && (
              <Badge
                data-awards-chip={"selected"}
                data-color={"brand"}
                variant={"light"}
                color={"brand"}
                size={"sm"}
                radius={"sm"}
                tt={"none"}
              >
                {selectedLabel ?? t("awards.shared.nominee.yourVote")}
              </Badge>
            )}
          </Group>
        </Stack>
        {onRemove && (
          <ActionIcon
            variant={"subtle"}
            color={"gray"}
            aria-label={removeLabel ?? t("awards.shared.nominee.remove")}
            onClick={(event) => {
              event.stopPropagation();
              onRemove(gameId);
            }}
          >
            <IconX size={16} />
          </ActionIcon>
        )}
      </Group>
    </Paper>
  );
};

export { AwardsNomineeCard };
