import React from "react";
import { ProfileStatsForPeriod, useUserId } from "#@/components";
import dayjs from "dayjs";
import { Period } from "#@/util";

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
