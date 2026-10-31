import { ProfileStatsForPeriod, useUserId } from "#@/components";
import { Period } from "#@/util";
import dayjs from "dayjs";

const UserRecentStatsReport = () => {
  const userId = useUserId();

  const now = dayjs();
  const isLastWeekOfMonth = now.date() > now.daysInMonth() - 7;

  const targetPeriod = isLastWeekOfMonth ? Period.MONTH : Period.WEEK;

  if (!userId) {
    return null;
  }

  return <ProfileStatsForPeriod userId={userId} period={targetPeriod} />;
};

export { UserRecentStatsReport };