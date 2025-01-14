import React from "react";
import {
    Activity,
    FindOneStatisticsDto,
    StatisticsActionDto,
} from "@/wrapper/server";
import ItemLikesButton from "@/components/statistics/input/ItemLikesButton";
import sourceType = FindOneStatisticsDto.sourceType;

interface Props {
    activity: Activity;
}

const ActivityItemLikes = ({ activity }: Props) => {
    return (
        <ItemLikesButton
            targetUserId={activity.profileUserId}
            sourceId={activity.id}
            sourceType={sourceType.ACTIVITY}
        />
    );
};

export default ActivityItemLikes;
