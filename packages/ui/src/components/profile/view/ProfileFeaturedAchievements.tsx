import React from "react";
import {
  AchievementItem,
  AchievementLogo,
  CenteredLoading,
  useAllObtainedAchievements,
} from "#@/components";
import { Center, Divider, Group, Stack, Text } from "@mantine/core";

interface Props {
  targetUserId: string | undefined;
  withEmptyMessage?: boolean;
}

const ProfileFeaturedAchievements = ({
  targetUserId,
  withEmptyMessage = false,
}: Props) => {
  const featuredAchievementsQuery = useAllObtainedAchievements(
    targetUserId,
    true,
  );

  const featuredAchievements = featuredAchievementsQuery.data ?? [];

  if (!targetUserId) {
    return null;
  }

  if (featuredAchievementsQuery.isLoading) {
    return <CenteredLoading />;
  }

  if (featuredAchievements.length === 0 && !withEmptyMessage) {
    return null;
  }

  return (
    <Group className={"w-full justify-center"}>
      {withEmptyMessage && featuredAchievements.length === 0 && (
        <Text className={"text-center"}>No featured achievements found.</Text>
      )}
      {featuredAchievements.map((featuredAchievement) => {
        return (
          <AchievementLogo
            key={`featured-${featuredAchievement.achievementId}`}
            achievementId={featuredAchievement.achievementId}
          />
        );
      })}
    </Group>
  );
};

export { ProfileFeaturedAchievements };
