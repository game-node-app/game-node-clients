import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconInfinity } from "@tabler/icons-react";
import {
  DailyHubLinkCard,
  DailyHubSection,
} from "#@/components/daily/view/DailyHubSection";

export const DAILY_PRACTICE_MODES = ["cover", "specs"] as const;
export type DailyPracticeMode = (typeof DAILY_PRACTICE_MODES)[number];

export const isDailyPracticeMode = (
  value: unknown,
): value is DailyPracticeMode =>
  DAILY_PRACTICE_MODES.includes(value as DailyPracticeMode);

/**
 * Hub links to the unlimited Cover and Specs rounds; the round starts on the practice screen.
 */
const DailyPracticeSection = () => {
  const { t } = useTranslation();

  return (
    <DailyHubSection
      title={t("daily.practice.section")}
      caption={
        <Text component={"span"} fz={12} className={"text-[#7A7A7A]"}>
          {t("daily.practice.noLimit")}
        </Text>
      }
    >
      {DAILY_PRACTICE_MODES.map((mode) => (
        <DailyHubLinkCard
          key={mode}
          href={`/daily/${mode}/practice`}
          icon={IconInfinity}
          title={t(`daily.practice.${mode}.title`)}
          description={t(`daily.practice.${mode}.description`)}
        />
      ))}
    </DailyHubSection>
  );
};

export { DailyPracticeSection };
