import React from "react";
import { Activity } from "@/wrapper/server";
import ReviewActivityItem from "@/components/activity/item/ReviewActivityItem";
import CollectionEntryActivityItem from "@/components/activity/item/CollectionEntryActivityItem";
import UserFollowActivityItem from "@/components/activity/item/UserFollowActivityItem";
import type = Activity.type;

interface Props {
    items: Activity[] | undefined;
}

const ActivityList = ({ items }: Props) => {
    if (!items) return null;
    return items.map((activity) => {
        switch (activity.type) {
            case type.REVIEW:
                return (
                    <ReviewActivityItem key={activity.id} activity={activity} />
                );
            case type.COLLECTION_ENTRY:
                return (
                    <CollectionEntryActivityItem
                        key={activity.id}
                        activity={activity}
                    />
                );
            case type.FOLLOW:
                return (
                    <UserFollowActivityItem
                        key={activity.id}
                        activity={activity}
                    />
                );
        }
    });
};

export default ActivityList;
