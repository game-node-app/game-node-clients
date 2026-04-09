import React from "react";
import { useGameAchievementsV2, useUserId } from "#@/components";

interface Props {
  gameId: number;
}

const GameInfoShareAchievementProgress = ({ gameId }: Props) => {
  const userId = useUserId();
  const achievementsQuery = useGameAchievementsV2(userId, gameId, true);

  return <div></div>;
};

export { GameInfoShareAchievementProgress };
