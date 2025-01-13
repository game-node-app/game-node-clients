import React from "react";
import {
    Box,
    Group,
    Paper,
    Stack,
    Image,
    Title,
    Text,
    Overlay,
} from "@mantine/core";
import { AchievementDto } from "@/wrapper/server";
import { useObtainedAchievement } from "@/components/achievement/hooks/useObtainedAchievement";
import { getServerStoredIcon } from "@/util/getServerStoredImages";
import AchievementLogo from "@/components/achievement/AchievementLogo";

interface Props {
    targetUserId: string;
    achievement: AchievementDto | undefined;
}

const AchievementItem = ({ targetUserId, achievement }: Props) => {
    if (!achievement) {
        return null;
    }

    return (
        <Paper
            className={"border-4 border-[#282828]"}
            w={"100%"}
            bg={
                "linear-gradient(90deg, rgba(30,30,30,1) 0%, rgba(30,30,30,0.85) 100%)"
            }
            withBorder
            pos={"relative"}
        >
            <Group
                wrap={"nowrap"}
                w={"100%"}
                h={"100%"}
                px={"1rem"}
                py={"1.5rem"}
            >
                <AchievementLogo achievementId={achievement.id} />
                <Stack gap={"0.5rem"} w={"50%"}>
                    <Title fz={"1rem"}>{achievement.name}</Title>
                    <Text fz={"0.85rem"} className={"break-words"}>
                        {achievement.description}
                    </Text>
                </Stack>
                <Stack ml={"auto"} gap={0} justify={"center"} align={"center"}>
                    <Title fz={"1.5rem"} className={"break-keep text-center"}>
                        {achievement.expGainAmount} XP
                    </Title>
                </Stack>
            </Group>
        </Paper>
    );
};

export default AchievementItem;
