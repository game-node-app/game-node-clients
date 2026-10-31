import React from "react";
import { Box, Image } from "@mantine/core";
import {
  IconAward,
  IconBolt,
  IconBook,
  IconBulb,
  IconCalendar,
  IconCompass,
  IconCrown,
  IconDeviceGamepad2,
  IconDiamond,
  IconFlag,
  IconFlame,
  IconGhost,
  IconGift,
  IconHeart,
  IconKey,
  IconLock,
  IconMap,
  IconMedal,
  IconMessage,
  IconMoon,
  IconMusic,
  IconPencil,
  IconPuzzle,
  IconRocket,
  IconShield,
  IconSkull,
  IconStar,
  IconSun,
  IconSword,
  IconTarget,
  IconTrophy,
  IconUsers,
  TablerIcon,
} from "@tabler/icons-react";
import { AchievementIconDto } from "@repo/wrapper/server";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import { useGame } from "#@/components/game/hooks/useGame";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";

/** Glyph names (kebab-case) clients can render. The admin icon picker reads this same map. */
export const ACHIEVEMENT_GLYPHS: Record<string, TablerIcon> = {
  award: IconAward,
  bolt: IconBolt,
  book: IconBook,
  bulb: IconBulb,
  calendar: IconCalendar,
  compass: IconCompass,
  controller: IconDeviceGamepad2,
  crown: IconCrown,
  diamond: IconDiamond,
  flag: IconFlag,
  flame: IconFlame,
  ghost: IconGhost,
  gift: IconGift,
  heart: IconHeart,
  key: IconKey,
  map: IconMap,
  medal: IconMedal,
  message: IconMessage,
  moon: IconMoon,
  music: IconMusic,
  pencil: IconPencil,
  puzzle: IconPuzzle,
  rocket: IconRocket,
  shield: IconShield,
  skull: IconSkull,
  star: IconStar,
  sun: IconSun,
  sword: IconSword,
  target: IconTarget,
  trophy: IconTrophy,
  users: IconUsers,
};

/** Frame color per tier level, index 0 is level 1. */
export const ACHIEVEMENT_TIER_COLORS = [
  "#b87333",
  "#a8a9ad",
  "#e0b341",
  "#3fb6a8",
  "#4a90e2",
  "#7e57c2",
  "#e05a9b",
  "#e5533d",
  "#f2994a",
  "#f5e663",
];

interface Props {
  icon: AchievementIconDto | null | undefined;
  /** 0 renders the locked state. */
  tier: number;
  size?: number;
}

const GameCover = ({ gameId, size }: { gameId: number; size: number }) => {
  const gameQuery = useGame(gameId, { relations: { cover: true } });
  const url = getCoverUrl(gameQuery.data);
  return url ? (
    <Image src={url} w={size} h={size} fit="cover" alt="" />
  ) : (
    <IconTrophy size={size * 0.5} />
  );
};

const AchievementBadge = ({ icon, tier, size = 48 }: Props) => {
  const locked = tier <= 0;
  const color = locked
    ? "#555555"
    : ACHIEVEMENT_TIER_COLORS[
        Math.min(tier, ACHIEVEMENT_TIER_COLORS.length) - 1
      ];

  let content: React.ReactNode;
  if (!icon) {
    content = <IconLock size={size * 0.5} />;
  } else if (icon.kind === AchievementIconDto.kind.GAME_COVER && icon.gameId) {
    content = <GameCover gameId={icon.gameId} size={size} />;
  } else if (icon.kind === AchievementIconDto.kind.IMAGE && icon.name) {
    content = (
      <Image
        src={getServerStoredIcon(icon.name)}
        w={size}
        h={size}
        fit="contain"
        alt={icon.name}
      />
    );
  } else {
    const Glyph = ACHIEVEMENT_GLYPHS[icon.name ?? ""] ?? IconTrophy;
    content = <Glyph size={size * 0.55} color={color} />;
  }

  return (
    <Box
      data-tier={tier}
      className={
        "flex items-center justify-center overflow-hidden rounded-full"
      }
      style={{
        width: size,
        minWidth: size,
        height: size,
        border: `3px solid ${color}`,
        opacity: locked ? 0.6 : 1,
        filter: locked ? "grayscale(1)" : undefined,
      }}
    >
      {content}
    </Box>
  );
};

export { AchievementBadge };
