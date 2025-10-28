import React, { useMemo } from "react";
import { AchievementItem, useAllObtainedAchievements } from "@repo/ui";

interface Props {
  userId: string;
}

const MobileProfileFeaturedAchievement = ({ userId }: Props) => {
  const obtainedAchievementsQuery = useAllObtainedAchievements(userId, true);

  const featuredAchievement = useMemo(() => {
    if (obtainedAchievementsQuery.data == undefined) return null;
    return obtainedAchievementsQuery.data.find(
      (achievement) => achievement.isFeatured,
    );
  }, [obtainedAchievementsQuery.data]);

  if (featuredAchievement == undefined) {
    return null;
  }

  return (
    <AchievementItem
      achievement={featuredAchievement.achievement}
      targetUserId={userId}
    ></AchievementItem>
  );
};

export { MobileProfileFeaturedAchievement };
