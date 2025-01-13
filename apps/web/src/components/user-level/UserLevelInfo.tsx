import React from "react";
import { useUserLevel } from "@/components/user-level/hooks/useUserLevel";
import { Group, Progress, Stack, Text } from "@mantine/core";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import Link from "next/link";

interface Props {
    targetUserId: string;
}

const UserLevelInfo = ({ targetUserId }: Props) => {
    const userLevelQuery = useUserLevel(targetUserId);
    const userLevel = userLevelQuery.data;
    const progress = userLevel
        ? (userLevel.currentLevelExp / userLevel.levelUpExpCost) * 100
        : 0;
    return (
        <Group w={"100%"}>
            <Stack w={"100%"} gap={2}>
                <Group justify={"space-between"} w={"100%"}>
                    <Text>Level {userLevel?.currentLevel ?? 1}</Text>
                    <Text>
                        {userLevel?.currentLevelExp ?? 0} /{" "}
                        {userLevel?.levelUpExpCost ?? 0} XP
                    </Text>
                </Group>
                <Progress
                    className={"w-full border-2 border-[#9A9A9A]"}
                    size="lg"
                    value={progress}
                />
            </Stack>
        </Group>
    );
};

export default UserLevelInfo;
