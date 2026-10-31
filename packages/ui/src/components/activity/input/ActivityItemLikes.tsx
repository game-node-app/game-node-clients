import { ItemLikesButton } from "#@/components/statistics/input/ItemLikesButton";
import {
    Activity,
    StatisticsSourceRequestDto,
} from "../../../../../wrapper/src/server";
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
