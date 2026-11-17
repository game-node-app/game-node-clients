import { Button, Skeleton, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconArrowRight, IconRefresh } from "@tabler/icons-react";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { DailyRankingCompactRow } from "#@/components/daily/ranking/DailyRankingCompactRow";
import {
  formatDailyCount,
  formatDailyPoints,
  toPositionChange,
} from "#@/components/daily/ranking/rankingFormat";
import { useDailyRanking } from "#@/components/daily/ranking/useDailyRanking";
import { DailyHubSection } from "#@/components/daily/view/DailyHubSection";
import { Link } from "#@/util/link";

/**
 * The hub's week top three, the viewer's position and a link to the full ranking.
 */
const DailyRankingPanel = () => {
  const { t, i18n } = useTranslation();
  const language = i18n?.language ?? "en";
  const userId = useUserId();
  const query = useDailyRanking({ period: "week", limit: 3 });
  const viewer = query.data?.viewer;
  const rows = query.data?.data ?? [];

  const you = (() => {
    if (!viewer) return null;
    const position = formatDailyCount(viewer.position, language);
    const change = toPositionChange(viewer.positionChange);
    const text =
      change.kind === "up" || change.kind === "down"
        ? t("daily.ranking.panel.youChange", {
            position,
            change: `${change.kind === "up" ? "+" : "−"}${change.amount}`,
          })
        : t("daily.ranking.panel.you", { position });
    return (
      <Text component={"span"} fz={13} fw={600} className={"text-brand-5"}>
        {text}
      </Text>
    );
  })();

  let body;
  if (query.isError) {
    body = (
      <div className={"flex items-center justify-between gap-3"}>
        <Text fz={13} c={"#ADADAD"}>
          {t("daily.fetchError")}
        </Text>
        <Button
          variant={"default"}
          size={"xs"}
          leftSection={<IconRefresh size={14} />}
          loading={query.isFetching}
          onClick={() => void query.refetch()}
        >
          {t("actions.retry")}
        </Button>
      </div>
    );
  } else if (!query.data) {
    body = [0, 1, 2].map((index) => <Skeleton key={index} h={30} />);
  } else {
    body = (
      <>
        {rows.length > 0 && (
          <div className={"-mx-2 flex flex-col"}>
            {rows.map((row) => (
              <DailyRankingCompactRow
                key={row.userId}
                position={row.position}
                userId={row.userId}
                username={row.username}
                avatar={row.avatar}
                supporterBadge={row.supporterBadge}
                isViewer={row.userId === userId}
                value={t("daily.ranking.points", {
                  points: formatDailyPoints(row.points, language),
                })}
              />
            ))}
          </div>
        )}
        {rows.length < 3 && (
          <Text fz={13} c={"#ADADAD"}>
            {t("daily.ranking.panel.invite")}
          </Text>
        )}
      </>
    );
  }

  return (
    <DailyHubSection
      title={t("daily.ranking.panel.title")}
      caption={you}
      highlighted
      className={"gap-2.5"}
    >
      {body}
      <Button
        component={Link}
        href={"/daily/ranking"}
        variant={"default"}
        fullWidth
        radius={8}
        h={38}
        fz={14}
        rightSection={<IconArrowRight size={16} />}
        className={"!border-0 !bg-nav-raised"}
      >
        {t("daily.ranking.panel.seeAll")}
      </Button>
    </DailyHubSection>
  );
};

export { DailyRankingPanel };
