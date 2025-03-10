import {
  AggregatedNotificationContentProps,
  getUniqueProfileNames,
  UserAvatar,
} from "#@/components";
import React, { useMemo } from "react";
import { Group, Text } from "@mantine/core";

interface Props extends AggregatedNotificationContentProps {
  actionText: string | React.ReactNode | undefined;
}

export function useNotificationContent({
  aggregatedNotification,
  actionText,
}: Props) {
  const profileNames = useMemo(() => {
    return getUniqueProfileNames(aggregatedNotification.notifications);
  }, [aggregatedNotification.notifications]);

  const latestNotification = aggregatedNotification.notifications[0];
  const latestNotificationUserId = latestNotification.profileUserId;
  const latestProfileNames = profileNames.slice(0, 2).join(", ");
  const extraProfilesCount = profileNames.length - latestProfileNames.length;

  return (
    <Group className={"w-full flex-nowrap"}>
      {latestNotificationUserId && (
        <UserAvatar userId={latestNotificationUserId} />
      )}
      <Text lineClamp={4}>
        <strong>{latestProfileNames}</strong>{" "}
        {extraProfilesCount > 0 && <span>and {extraProfilesCount} others</span>}{" "}
        {actionText}.
      </Text>
    </Group>
  );
}
