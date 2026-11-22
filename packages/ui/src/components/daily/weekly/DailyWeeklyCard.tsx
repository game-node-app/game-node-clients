import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { DailyWeeklyDto } from "@repo/wrapper/server";
import { IconTrophy } from "@tabler/icons-react";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useDailyLocalResults } from "#@/components/daily/hooks/useDailyLocalResults";
import { DailyStatusBadge } from "#@/components/daily/result/DailyStatusBadge";
import { startedDailyResult } from "#@/components/daily/util/startedDailyResult";
import {
  DailyHubLinkCard,
  DailyHubSection,
} from "#@/components/daily/view/DailyHubSection";

/**
 * The hub's weekly challenge card, with the player's status: the account's
 * when signed in, else the device's.
 */
const DailyWeeklyCard = ({ weekly }: { weekly: DailyWeeklyDto }) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const [local] = useDailyLocalResults();
  const result = startedDailyResult(userId ? weekly.result : local[weekly.id]);

  return (
    <DailyHubSection
      title={t("daily.weekly.section")}
      caption={
        <Text component={"span"} fz={12} className={"text-faint"}>
          {t("daily.weekly.resets")}
        </Text>
      }
    >
      <DailyHubLinkCard
        href={"/daily/weekly"}
        icon={IconTrophy}
        title={t("daily.weekly.titleNumber", { number: weekly.number })}
        description={t("daily.weekly.description")}
        aside={result && <DailyStatusBadge result={result} />}
      />
    </DailyHubSection>
  );
};

export { DailyWeeklyCard };
