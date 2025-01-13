import React, { useMemo } from "react";
import { useAchievements } from "@/components/achievement/hooks/useAchievements";
import { Center, Group, Modal, Select, Stack, Text } from "@mantine/core";
import { useFeaturedObtainedAchievement } from "@/components/achievement/hooks/useFeaturedObtainedAchievement";
import useUserId from "@/components/auth/hooks/useUserId";
import AchievementItem from "@/components/achievement/AchievementItem";
import { useAllObtainedAchievements } from "@/components/achievement/hooks/useAllObtainedAchievements";
import { useMutation } from "@tanstack/react-query";
import { shuffleArray } from "@/util/shuffleArray";
import { useDisclosure } from "@mantine/hooks";
import { AchievementDto, AchievementsService } from "@/wrapper/server";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import CenteredLoading from "@/components/general/CenteredLoading";

const ProfileEditFeaturedAchievement = () => {
    const [opened, modalUtils] = useDisclosure(false);

    const userId = useUserId();
    const achievements = useAchievements({
        limit: 1000,
    });

    const allObtainedAchievements = useAllObtainedAchievements(userId);
    const featuredAchievementQuery = useFeaturedObtainedAchievement(userId);
    const featuredAchievement = featuredAchievementQuery.data;
    const featuredAchievementReference = useMemo(() => {
        if (achievements && featuredAchievement) {
            return achievements.data?.data.find((achievement) => {
                return achievement.id === featuredAchievement.achievementId;
            });
        }

        return undefined;
    }, [achievements, featuredAchievement]);

    const featuredAchievementMutation = useMutation({
        mutationFn: async (achievementId: string) => {
            return AchievementsService.achievementsControllerUpdateFeaturedObtainedAchievementV1(
                achievementId,
                {
                    isFeatured: true,
                },
            );
        },
        onSuccess: () => {
            notifications.show({
                message: "Successfully updated featured achievement!",
            });
        },
        onError: (err) => {
            notifications.show({
                message:
                    "Error while trying to update featured achievement: " +
                    err.message,
            });
        },
        onSettled: () => {
            allObtainedAchievements.invalidate();
            modalUtils.close();
        },
    });

    const fakeSelectAchievement: AchievementDto = {
        name: "Select your first featured achievement",
        expGainAmount: 0,
        description: "It's on us, don't worry.",
        id: "campfire",
        category: 0,
    };

    if (
        !userId ||
        achievements.data == undefined ||
        allObtainedAchievements.data == undefined
    ) {
        return (
            <Group>
                <Text>No obtained achievement found.</Text>
            </Group>
        );
    }

    return (
        <Stack className={"w-full"}>
            <Modal
                opened={opened}
                onClose={modalUtils.close}
                title={"Select a new featured achievement"}
            >
                <Modal.Body>
                    {allObtainedAchievements.data ? (
                        <Stack>
                            <Select
                                defaultValue={`${featuredAchievement?.id}`}
                                data={allObtainedAchievements.data.map(
                                    (obtainedAchievement) => {
                                        const achievementEntity =
                                            achievements.data.data.find(
                                                (achievement) => {
                                                    return (
                                                        achievement.id ===
                                                        obtainedAchievement.achievementId
                                                    );
                                                },
                                            );
                                        return {
                                            label: achievementEntity!.name,
                                            value: achievementEntity!.id,
                                        };
                                    },
                                )}
                                onChange={(id) => {
                                    if (id) {
                                        featuredAchievementMutation.mutate(id);
                                    }
                                }}
                            />
                        </Stack>
                    ) : (
                        <Text>
                            You have not obtained any achievements. Return here
                            later, adventurer!
                        </Text>
                    )}
                </Modal.Body>
            </Modal>
            <Link href={"#"} onClick={modalUtils.open}>
                {featuredAchievementQuery.isLoading && <CenteredLoading />}
                {featuredAchievementQuery.isSuccess &&
                featuredAchievementReference ? (
                    <AchievementItem
                        targetUserId={userId!}
                        achievement={featuredAchievementReference}
                    />
                ) : (
                    <AchievementItem
                        targetUserId={userId}
                        achievement={fakeSelectAchievement}
                    />
                )}
            </Link>
        </Stack>
    );
};

export default ProfileEditFeaturedAchievement;
