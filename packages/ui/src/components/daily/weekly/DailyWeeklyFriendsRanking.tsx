import { Button, Skeleton, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconRefresh } from "@tabler/icons-react";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { DailyRankingCompactRow } from "#@/components/daily/ranking/DailyRankingCompactRow";
import { useDailyWeeklyRanking } from "#@/components/daily/weekly/useDailyWeeklyRanking";

/**
 * The weekly challenge ranked among friends: attempts for a win, "not
 * guessed" for a loss, an invite to follow people when the viewer is alone.
 */
const DailyWeeklyFriendsRanking = () => {
  const { t } = useTranslation();
  const userId = useUserId();
  const query = useDailyWeeklyRanking();
  const rows = query.data?.data ?? [];

  let body;
  if (query.isError) {
    body = (
      <div className={"flex items-center justify-between gap-3"}>
        <Text fz={13} c={"var(--gn-text-subtle)"}>
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
        <div className={"-mx-2 flex flex-col"}>
          {rows.map((row, index) => (
            <DailyRankingCompactRow
              key={row.userId}
              position={index + 1}
              userId={row.userId}
              username={row.username}
              avatar={row.avatar}
              supporterBadge={row.supporterBadge}
              isViewer={row.userId === userId}
              value={
                row.status === "won" ? (
                  t(
                    row.attempts === 1
                      ? "daily.weekly.friends.attemptsOne"
                      : "daily.weekly.friends.attempts",
                    { count: row.attempts },
                  )
                ) : row.status === "lost" ? (
                  <span className={"font-medium text-faint"}>
                    {t("daily.weekly.friends.notGuessed")}
                  </span>
                ) : (
                  <span className={"font-medium text-faint"}>
                    {t("daily.status.inProgress")}
                  </span>
                )
              }
            />
          ))}
        </div>
        {rows.every((row) => row.userId === userId) && (
          <Text fz={13} c={"var(--gn-text-subtle)"}>
            {t("daily.weekly.friends.invite")}
          </Text>
        )}
      </>
    );
  }

  return (
    <section
      className={
        "flex w-full flex-col gap-2.5 rounded-[14px] border border-solid border-line bg-paper-7 p-4 sm:p-5"
      }
    >
      <Text
        component={"h2"}
        fz={18}
        fw={700}
        c="var(--gn-text)"
        className={"m-0"}
      >
        {t("daily.weekly.friends.title")}
      </Text>
      {body}
    </section>
  );
};

export { DailyWeeklyFriendsRanking };
