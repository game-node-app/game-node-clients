import { Button, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconArrowRight, IconClock } from "@tabler/icons-react";
import { Link } from "#@/util/link";

/**
 * Today's ranking with few players: how many scored and a link to play.
 */
const DailyRankingEarlyBanner = ({
  totalPlayers,
}: {
  totalPlayers: number;
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={
        "flex flex-wrap items-center gap-3 rounded-[12px] border border-solid border-brand-5 bg-nav-accent-subtle p-4"
      }
    >
      <IconClock size={20} className={"shrink-0 text-brand-5"} aria-hidden />
      <div className={"flex min-w-[200px] flex-1 flex-col gap-0.5"}>
        <Text fz={15} fw={700} c="var(--gn-text)">
          {t(
            totalPlayers === 1
              ? "daily.ranking.early.titleOne"
              : "daily.ranking.early.title",
            { count: totalPlayers },
          )}
        </Text>
        <Text fz={13} c={"var(--gn-text-subtle)"}>
          {t("daily.ranking.early.description")}
        </Text>
      </div>
      <Button
        component={Link}
        href={"/daily"}
        radius={8}
        h={40}
        px={16}
        fz={14}
        className={"!text-on-brand"}
        rightSection={<IconArrowRight size={16} />}
      >
        {t("daily.ranking.early.action")}
      </Button>
    </div>
  );
};

export { DailyRankingEarlyBanner };
