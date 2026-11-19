import { ActivityItem, ActivityItemProps } from "#@/components";
import { useLatestActivities } from "#@/components/activity/hooks/useLatestActivities";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { cn } from "#@/util";
import { Skeleton, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { Activity } from "@repo/wrapper/server";

interface Props extends Omit<ActivityItemProps, "activity"> {
  userId?: string;
  limit?: number;
  offset?: number;
  type?: Activity.type;
  /**
   * `carousel` renders compact cards in a horizontal snap-scroller,
   * meant for space-constrained screens (mobile home).
   * @default "list"
   */
  layout?: "list" | "carousel";
}

const RecentActivityList = ({
  userId,
  offset = 0,
  limit = 5,
  type,
  layout = "list",
  ...others
}: Props) => {
  const { t } = useTranslation();
  const activitiesQuery = useLatestActivities(userId, offset, limit, type);
  const isEmpty =
    !activitiesQuery.isLoading &&
    activitiesQuery.isSuccess &&
    (activitiesQuery.data == undefined ||
      activitiesQuery.data.data.length === 0);

  if (layout === "carousel") {
    return (
      <div
        className={cn(
          "flex w-full snap-x snap-mandatory items-stretch gap-3 overflow-x-auto pb-1",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {activitiesQuery.isLoading &&
          Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className={"h-28 w-64 shrink-0"} />
          ))}
        {activitiesQuery.data?.data?.map((activity) => (
          <div key={activity.id} className={"w-64 shrink-0 snap-start"}>
            <ActivityItem activity={activity} variant={"card"} {...others} />
          </div>
        ))}
        {activitiesQuery.isError && (
          <CenteredErrorMessage error={activitiesQuery.error} />
        )}
        {isEmpty && (
          <CenteredErrorMessage
            message={t("activity.messages.noRecentActivity")}
          />
        )}
      </div>
    );
  }

  return (
    <Stack className={"w-full h-full"}>
      {activitiesQuery.isLoading && <CenteredLoading />}
      {activitiesQuery.data?.data?.map((activity) => {
        return (
          <ActivityItem key={activity.id} activity={activity} {...others} />
        );
      })}
      {activitiesQuery.isError && (
        <CenteredErrorMessage error={activitiesQuery.error} />
      )}
      {isEmpty && (
        <CenteredErrorMessage
          message={t("activity.messages.noRecentActivity")}
        />
      )}
    </Stack>
  );
};

export { RecentActivityList };
