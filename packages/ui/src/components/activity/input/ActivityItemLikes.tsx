import { InitialItemStatistics } from "#@/components/statistics/hooks/useItemStatistics";
import { ItemLikesButton } from "#@/components/statistics/input/ItemLikesButton";
import {
  Activity,
  ActivityResponseDto,
  StatisticsSourceRequestDto,
} from "@repo/wrapper/server";
import sourceType = StatisticsSourceRequestDto.sourceType;

export type ActivityLikesItem =
  | (Activity & {
      statistics?: InitialItemStatistics | null;
    })
  | ActivityResponseDto;

interface Props {
  activity: ActivityLikesItem;
}

const ActivityItemLikes = ({ activity }: Props) => {
  return (
    <ItemLikesButton
      sourceId={activity.id}
      sourceType={sourceType.ACTIVITY}
      initialStatistics={activity.statistics ?? undefined}
    />
  );
};

export { ActivityItemLikes };
