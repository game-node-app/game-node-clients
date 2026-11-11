import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
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
}

/** Translated supporter title under the username (design D4). */
export function SupporterTitle({
  titleKey,
  perks = null,
  className,
}: SupporterTitleProps) {
  const { t } = useTranslation();

  if (!titleKey) return null;

  const color = perks?.theme ? perks.accentText : "#adadad";

  return (
    <Text
      fz={13}
      fw={500}
      lh={"normal"}
      className={className}
      style={{ color }}
    >
      {t(getSupporterTitleLabelKey(titleKey))}
    </Text>
  );
}
