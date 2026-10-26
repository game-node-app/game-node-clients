import React from "react";
import {
  Activity,
  StatisticsSourceRequestDto,
} from "../../../../../wrapper/src/server";
import { ItemLikesButton } from "#@/components/statistics/input/ItemLikesButton";
import sourceType = StatisticsSourceRequestDto.sourceType;

interface Props {
  activity: Activity;
}

const ActivityItemLikes = ({ activity }: Props) => {
  return (
    <ItemLikesButton
      sourceId={activity.id}
      sourceType={sourceType.ACTIVITY}
    />
  );
};

export { ActivityItemLikes };
