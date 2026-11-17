import type { AwardsNomineeStatus } from "#@/components/awards/types";
import {
  formatPlaytimeHours,
  formatRatingCompact,
  toPlaytimeHours,
  useFormatLocale,
} from "#@/components/events/util/format";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import type { TGameOrSearchGame } from "#@/components/game/util/types";
import { cn } from "#@/util";
import { ActionIcon, Box, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconCheck, IconX } from "@tabler/icons-react";
import type { KeyboardEvent, ReactNode } from "react";
import { AwardsGameCover } from "./AwardsGameCover";
import { AwardsStatusChip, type AwardsChipTone } from "./AwardsStatusChip";
import { useAwardsMobileLayout } from "./useAwardsMobileLayout";

/**
 * `grid` is the vertical card of the nominee grid (frame `5408:716`); `row` is
 * the compact horizontal card used outside the grid (voted game, suggestion
 * and the nominations lists).
 */
export type AwardsNomineeCardLayout = "grid" | "row";

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
  layout?: AwardsNomineeCardLayout;
  className?: string;
}

const STATUS_TONES: Record<AwardsNomineeStatus, AwardsChipTone> = {
  played: "played",
  planned: "brand",
  not_played: "neutral",
};

/**
 * Nominee card from the design component `5408:716`: cover, name, developer and
 * platforms, the viewer's play status as a chip and, when selected, the
 * "Seu voto" badge over the cover and the brand-tinted frame.
 *
 * Below `md` it follows the mobile frame: no frame until selected, no
 * developer line and the short chip copy.
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
  layout = "row",
  className,
}: AwardsNomineeCardProps) => {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const compact = useAwardsMobileLayout();

  let statusText: string | null = null;

  if (status === "played") {
    const roundedHours = toPlaytimeHours(playtimeSeconds);
    const hours =
      roundedHours != null && roundedHours > 0
        ? formatPlaytimeHours(playtimeSeconds, locale)
        : null;
    const ratingText = formatRatingCompact(rating, locale);

    if (compact) {
      statusText = hours
        ? t("awards.shared.nominee.playedHoursCompact", { hours })
        : t("awards.shared.nominee.playedCompact");
    } else if (hours && ratingText) {
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

  const statusChip =
    statusText && status ? (
      <AwardsStatusChip
        data-awards-chip={status}
        tone={STATUS_TONES[status]}
        className={"truncate"}
      >
        {statusText}
      </AwardsStatusChip>
    ) : null;

  const selectedBadge = selected ? (
    <span
      data-awards-chip={"selected"}
      data-color={"brand"}
      className={cn(
        "inline-flex items-center gap-1 bg-brand font-bold uppercase leading-[normal] tracking-[0.72px] text-[#0b0b0b]",
        "text-[12px]",
        compact ? "rounded-md px-2 py-1" : "rounded-full py-1.5 pl-2 pr-3",
        layout === "grid" && "absolute z-10",
        layout === "grid" &&
          (compact ? "left-3 top-3" : "left-[14px] top-[14px]"),
      )}
    >
      <IconCheck size={compact ? 12 : 16} stroke={3} aria-hidden={"true"} />
      {selectedLabel ?? t("awards.shared.nominee.yourVote")}
    </span>
  ) : null;

  const removeAction = onRemove ? (
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
  ) : null;

  const rootProps = {
    "data-awards-nominee-card": true,
    "data-game-id": gameId,
    "data-status": status ?? "none",
    "data-selected": selected ? "true" : "false",
    "data-layout": layout,
    role: isInteractive ? "button" : undefined,
    tabIndex: isInteractive ? 0 : undefined,
    "aria-pressed": isInteractive ? selected : undefined,
    onClick: isInteractive ? select : undefined,
    onKeyDown: isInteractive ? onKeyDown : undefined,
  } as const;

  if (layout === "grid") {
    const frameless = compact && !selected;

    return (
      <div
        {...rootProps}
        className={cn(
          "relative flex w-full flex-col",
          compact ? "gap-2.5 rounded-[12px]" : "gap-3 rounded-[14px]",
          selected
            ? "border-2 border-brand bg-brand-tint"
            : frameless
              ? "border-0"
              : "border border-line bg-paper-5",
          selected ? (compact ? "p-1.5" : "p-2") : frameless ? "p-0" : "p-2",
          isInteractive && "cursor-pointer",
          isInteractive && !selected && !compact && "hover:border-line-strong",
          disabled && "opacity-60",
          className,
        )}
      >
        {selectedBadge}
        <Box className={"relative"}>
          <AwardsGameCover
            game={game}
            size={ImageSize.COVER_BIG}
            className={"aspect-[231/280] h-auto"}
            imageProps={{ radius: 8 }}
          />
          {removeAction && (
            <Box className={"absolute right-2 top-2 rounded-md bg-black/60"}>
              {removeAction}
            </Box>
          )}
        </Box>
        <Stack
          gap={compact ? 8 : 8}
          className={cn("min-w-0", compact ? "px-0" : "px-1 pb-1.5")}
        >
          <Text
            className={cn(
              "break-words leading-[normal] text-white",
              compact ? "text-[16px] font-medium" : "text-[20px] font-semibold",
            )}
          >
            {game?.name}
          </Text>
          {metadata && !compact && (
            <Text className={"text-[14px] leading-[1.43] text-nav-muted"}>
              {metadata}
            </Text>
          )}
          {statusChip}
        </Stack>
      </div>
    );
  }

  return (
    <div
      {...rootProps}
      className={cn(
        "w-full rounded-[14px] p-3",
        selected
          ? "border-2 border-brand bg-brand-tint"
          : "border border-line bg-paper-5",
        isInteractive && "cursor-pointer",
        disabled && "opacity-60",
        className,
      )}
    >
      <Group align={"flex-start"} wrap={"nowrap"} gap={"sm"}>
        <Box className={"w-16 shrink-0"}>
          <AwardsGameCover game={game} />
        </Box>
        <Stack gap={6} className={"min-w-0 flex-1"}>
          <Text fw={600} className={"truncate"}>
            {game?.name}
          </Text>
          {metadata && (
            <Text size={"xs"} c={"dimmed"} className={"truncate"}>
              {metadata}
            </Text>
          )}
          <Group gap={6} wrap={"wrap"}>
            {statusChip}
            {selectedBadge}
          </Group>
        </Stack>
        {removeAction}
      </Group>
    </div>
  );
};

export { AwardsNomineeCard };
