import React from "react";
import getTimeSinceString from "@/util/getTimeSinceString";
import { Text } from "@mantine/core";

interface Props {
    createdAtDate: string | undefined;
}

const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

const ActivityCreateDate = ({ createdAtDate }: Props) => {
    if (!createdAtDate) {
        return;
    }
    const createdAt = new Date(createdAtDate);
    const timeSince = getTimeSinceString(createdAt);
    const isSevenDaysOrOlder =
        new Date().getTime() - createdAt.getTime() >= sevenDaysMs;
    return (
        <Text c={"dimmed"} fz={"sm"}>
            {isSevenDaysOrOlder
                ? createdAt.toLocaleDateString()
                : `${timeSince} ago`}
        </Text>
    );
};

export default ActivityCreateDate;
