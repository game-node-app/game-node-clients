import { AchievementItem } from "#@/components/achievement/AchievementItem";
import { useAchievementProgress } from "#@/components/achievement/hooks/useAchievementProgress";
import { useAchievementsV2 } from "#@/components/achievement/hooks/useAchievementsV2";

interface Props {
  targetUserId: string;
  achievementId: string;
}

const ObtainedAchievementItem = ({ achievementId, targetUserId }: Props) => {
  const achievementsQuery = useAchievementsV2(targetUserId);
  const progressQuery = useAchievementProgress(targetUserId);
  const achievement = achievementsQuery.data?.find(
    (a) => a.id === achievementId,
  );
  if (!achievement) return null;
  return (
    <AchievementItem
      achievement={achievement}
      progress={progressQuery.data?.find(
        (p) => p.achievementId === achievementId,
      )}
    />
  );
};

export { ObtainedAchievementItem };