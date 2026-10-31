import React from "react";
import { AchievementBadge } from "./AchievementBadge";
import { useAchievementsV2 } from "./hooks/useAchievementsV2";
import { useAchievementProgress } from "./hooks/useAchievementProgress";

interface Props {
  achievementId: string;
  targetUserId: string | undefined;
  size?: number;
}

/** Badge of an achievement at the highest tier `targetUserId` holds. */
const AchievementLogo = ({ achievementId, targetUserId, size }: Props) => {
  const achievementsQuery = useAchievementsV2(targetUserId);
  const progressQuery = useAchievementProgress(targetUserId);
  const achievement = achievementsQuery.data?.find(
    (a) => a.id === achievementId,
  );
  const tier =
    progressQuery.data?.find((p) => p.achievementId === achievementId)?.tier ??
    0;

  return <AchievementBadge icon={achievement?.icon} tier={tier} size={size} />;
};

export { AchievementLogo };
