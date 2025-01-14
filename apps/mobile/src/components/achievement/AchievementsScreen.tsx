import React, { useState } from "react";
import { Box, Button, Center, Divider, Group, Pagination, Paper, Progress, SimpleGrid, Stack } from "@mantine/core";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import useUserId from "@/components/auth/hooks/useUserId";
import { useAchievements } from "@/components/achievement/hooks/useAchievements";
import AchievementItem from "@/components/achievement/AchievementItem";
import UserLevelInfo from "@/components/user-level/UserLevelInfo";
import CenteredLoading from "@/components/general/CenteredLoading";
import UserAvatarWithLevelInfo from "@/components/general/avatar/UserAvatarWithLevelInfo";

interface Props {
    targetUserId: string;
}

const AchievementsScreen = ({ targetUserId }: Props) => {
    const userId = useUserId();
    const [paginationData, setPaginationData] = useState({
        offset: 0,
        limit: 8,
    });
    const achievements = useAchievements(paginationData);
    const isOwnUserId = userId != undefined && userId === targetUserId;
    if (!targetUserId) return null;
    return (
        <Stack w={"100%"} py={"3rem"} px={"2rem"}>
            <Group wrap={"wrap"} className={"justify-center"}>
                <Box className={"w-full"}>
                    <UserAvatarWithLevelInfo userId={targetUserId} />
                </Box>

                {isOwnUserId && (
                    <Button className={"mt-4"} disabled>
                        Redeem a code
                    </Button>
                )}
            </Group>

            <Divider className={"w-full"} />
            {achievements.isError && (
                <Center className={"mt-10"}>Something happened while loading achievements. Please try again.</Center>
            )}
            {achievements.isLoading && <CenteredLoading />}
            <SimpleGrid
                cols={{
                    base: 1,
                    lg: 2,
                }}
            >
                {achievements.data?.data?.map((achievement) => {
                    return (
                        <AchievementItem key={achievement.id} targetUserId={targetUserId} achievement={achievement} />
                    );
                })}
            </SimpleGrid>
            <Center mt={"1rem"}>
                <Pagination
                    total={achievements.data?.pagination?.totalPages || 1}
                    onChange={(page) => {
                        const pageAsOffset = paginationData.limit * (page - 1);
                        setPaginationData({
                            offset: pageAsOffset,
                            limit: paginationData.limit,
                        });
                    }}
                />
            </Center>
        </Stack>
    );
};

export default AchievementsScreen;
