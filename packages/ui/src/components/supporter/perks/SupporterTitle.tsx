import { Group, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  IconCircleCheck,
  IconCoffee,
  IconCompass,
  IconCrown,
  IconDeviceGamepad,
  IconHeartHandshake,
  IconMoonStars,
  IconQuote,
  IconStack2,
  IconStopwatch,
} from "@tabler/icons-react";
import { cn } from "#@/util";
import type { ActiveSupporterPerks } from "./supporterPerks";
import {
  getSupporterTitleLabelKey,
  type SupporterTitleKey,
} from "./supporterTitles";

export interface SupporterTitleProps {
  /** Key from the client catalog; null renders nothing. */
  titleKey: SupporterTitleKey | null;
  /** Active perks, read for the theme color. */
  perks?: ActiveSupporterPerks | null;
  className?: string;
  variant?: "text" | "chip";
}

const TITLE_ICONS = {
  supporter: IconCrown,
  patron: IconHeartHandshake,
  collector: IconStack2,
  completionist: IconCircleCheck,
  explorer: IconCompass,
  critic: IconQuote,
  night_owl: IconMoonStars,
  retro_fan: IconDeviceGamepad,
  speedrunner: IconStopwatch,
  cozy_gamer: IconCoffee,
} satisfies Record<SupporterTitleKey, typeof IconCrown>;
export function SupporterTitle({
  titleKey,
  perks = null,
  className,
  variant = "text",
}: SupporterTitleProps) {
  const { t } = useTranslation();

  if (!titleKey) return null;

  const label = t(getSupporterTitleLabelKey(titleKey));
  if (variant === "chip") {
    const Icon = TITLE_ICONS[titleKey];
    return (
      <Group
        gap={6}
        wrap="nowrap"
        className={cn(
          "w-fit rounded-md border border-solid px-2 py-1 text-[11px] font-semibold uppercase leading-none tracking-wider",
          className,
        )}
        style={{
          color: perks?.theme ? perks.accentText : "var(--gn-premium-text)",
          borderColor: perks?.theme
            ? perks.accentBorder
            : "color-mix(in srgb, var(--gn-premium) 45%, transparent)",
        }}
      >
        <Icon size={12} aria-hidden />
        {label}
      </Group>
    );
  }

  return (
    <Text
      fz={13}
      fw={500}
      lh={"normal"}
      className={cn(!perks?.theme && "text-dimmed-2", className)}
      style={perks?.theme ? { color: perks.accentText } : undefined}
    >
      {label}
    </Text>
  );
}
