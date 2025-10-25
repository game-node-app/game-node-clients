import React from "react";
import { Period } from "#@/util";
import {
  CenteredLoading,
  DetailsBox,
  ProfileStatsDataIcon,
  ProfileStatsDataIconProps,
  useProfileMetricsReport,
  useUserId,
} from "#@/components";
import { match } from "ts-pattern";
import { Group, SimpleGrid, Text } from "@mantine/core";
import {
  IconClock,
  IconDeviceGamepad2,
  IconListCheck,
  IconMessage,
} from "@tabler/icons-react";
import dayjs from "dayjs";

interface Props {
  userId: string;
  period: Period.WEEK | Period.MONTH;
}

const COMMON_ICON_PROPS: Partial<ProfileStatsDataIconProps> = {
  titleProps: {
    className: "text-lg text-center",
  },
  wrapperProps: {
    className: "items-center flex-col gap-2",
  },
  iconProps: {
    size: "1.5rem",
  },
  descriptionProps: {
    className: "text-center text-sm",
  },
};

const ProfileStatsForPeriod = ({ userId, period }: Props) => {
  const ownUserId = useUserId();
  const isOwnProfile = ownUserId === userId;

  const { data: reportForPeriod, isPending } = useProfileMetricsReport(
    userId,
    period,
  );

  const periodFrom = match(period)
    .with(Period.WEEK, () => ({
      start: dayjs().startOf("week").format("ll"),
      end: dayjs().endOf("week").format("ll"),
    }))
    .with(Period.MONTH, () => ({
      start: dayjs().startOf("month").format("ll"),
      end: dayjs().endOf("month").format("ll"),
    }))
    .exhaustive();

  const totalPlaytimeHours = reportForPeriod
    ? Math.ceil(reportForPeriod.playtimeSecondsInPeriod / 3600)
    : 0;

  const userReference = isOwnProfile ? "Your" : "This user's";

  if (isPending) {
    return <CenteredLoading />;
  }
  if (reportForPeriod == undefined) {
    return null;
  }

  return (
    <DetailsBox title={`${userReference} recent activity`}>
      <Text className={"text-sm text-dimmed"}>
        From {periodFrom.start} to {periodFrom.end} (this{" "}
        <span className={"font-bold"}>
          {period === Period.WEEK ? "week" : "month"}
        </span>
        )
      </Text>
      <SimpleGrid
        cols={{
          base: 4,
          lg: 4,
        }}
        spacing={"lg"}
      >
        <ProfileStatsDataIcon
          description={`Games played`}
          icon={IconDeviceGamepad2}
          count={reportForPeriod.playedInPeriod}
          {...COMMON_ICON_PROPS}
        />
        <ProfileStatsDataIcon
          description={`Games finished`}
          icon={IconListCheck}
          count={reportForPeriod.playedInPeriod}
          {...COMMON_ICON_PROPS}
        />
        <ProfileStatsDataIcon
          description={`Reviews`}
          icon={IconMessage}
          count={reportForPeriod.playedInPeriod}
          {...COMMON_ICON_PROPS}
        />
        <ProfileStatsDataIcon
          description={`Hours played`}
          icon={IconClock}
          count={totalPlaytimeHours}
          {...COMMON_ICON_PROPS}
        />
      </SimpleGrid>
    </DetailsBox>
  );
};

export { ProfileStatsForPeriod };
