import { Box, Group, Text } from "@mantine/core";
import { IconBrandSteam } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { Link } from "#@/util";
import { useProfilePresence } from "../hooks/useProfilePresence";
import type { ActiveSupporterPerks } from "./supporterPerks";
import classes from "./SupporterPresenceChip.module.css";

export interface SupporterPresenceChipProps {
  userId: string;
  /** Active perks; only the theme flag and its colors are read. */
  perks?: ActiveSupporterPerks | null;
}

/**
 * "Playing now" pill from the public presence endpoint (design D6). Renders
 * nothing while the request is in flight, on error, or when the player is not
 * in a game. The whole pill links to the game page when the catalog knows it.
 */
export function SupporterPresenceChip({
  userId,
  perks = null,
}: SupporterPresenceChipProps) {
  const { t } = useTranslation();
  const presenceQuery = useProfilePresence(userId, !!perks?.liveProfile);
  const playing = presenceQuery.data?.playing;

  if (presenceQuery.isLoading || presenceQuery.isError || !playing) return null;

  const colors = perks?.theme
    ? {
        backgroundColor: perks.accentSoft,
        borderColor: perks.accentBorder,
      }
    : {
        backgroundColor: "#1f1f1f",
        borderColor: "#2a2a2a",
      };
  const label = `${t("supporter.presence.playingNow")}: ${playing.name}`;

  const chip = (
    <Group
      gap={6}
      wrap={"nowrap"}
      align={"center"}
      data-testid={"supporter-presence-chip"}
      className={"h-7 max-w-full rounded-full border border-solid px-2.5"}
      style={colors}
      aria-label={playing.gameId == null ? label : undefined}
    >
      <Box component={"span"} className={classes.dot} aria-hidden />
      <IconBrandSteam size={14} color={"#adadad"} aria-hidden />
      <Text component={"span"} fz={12} fw={500} lh={"normal"} c={"#adadad"}>
        {`${t("supporter.presence.playingNow")} · `}
      </Text>
      <Text
        component={"span"}
        fz={12}
        fw={500}
        lh={"normal"}
        c={"white"}
        className={"inline-block max-w-[14rem] truncate"}
      >
        {playing.name}
      </Text>
    </Group>
  );

  if (playing.gameId == null) return chip;

  return (
    <Link
      href={`/game/${playing.gameId}`}
      aria-label={label}
      className={"inline-flex max-w-full"}
    >
      {chip}
    </Link>
  );
}
