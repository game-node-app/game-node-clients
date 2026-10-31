import { ObtainedAchievementItem, useAllObtainedAchievements } from "@repo/ui";
import { useMemo } from "react";

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
    <ObtainedAchievementItem
      achievementId={featuredAchievement.achievementId}
      targetUserId={userId}
    />
  );
};

export { MobileProfileFeaturedAchievement };