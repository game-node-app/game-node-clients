"use client";

import React, { useCallback, useState } from "react";
import {
    Button,
    ComboboxItem,
    MultiSelect,
    Paper,
    Select,
    Stack,
} from "@mantine/core";
import { useUserProfiles } from "@/components/profile/hooks/useUserProfiles";
import { useAchievements } from "@/components/achievement/hooks/useAchievements";
import useUserId from "@/components/auth/hooks/useUserId";
import AchievementItem from "@/components/achievement/AchievementItem";
import { useMutation } from "@tanstack/react-query";
import { AchievementsService, ApiError } from "@/wrapper/server";
import { notifications } from "@mantine/notifications";

const AchievementsGrantView = () => {
    const userId = useUserId();

    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const profilesQuery = useUserProfiles();

    const [selectedAchievementId, setSelectedAchievementId] = useState<
        string | undefined
    >(undefined);
    const achievementsQuery = useAchievements({});

    const buildAchievementsOptions = useCallback((): ComboboxItem[] => {
        if (!achievementsQuery.data) return [];

        return achievementsQuery.data.data.map((achievement): ComboboxItem => {
            return {
                value: achievement.id,
                label: achievement.name,
            };
        });
    }, [achievementsQuery.data]);

    const getSelectedAchievement = useCallback(() => {
        if (!achievementsQuery.data || !selectedAchievementId) return undefined;

        return achievementsQuery.data?.data.find(
            (achievement) => achievement.id === selectedAchievementId,
        );
    }, [achievementsQuery.data, selectedAchievementId]);

    const buildUserOptions = useCallback(() => {
        if (!profilesQuery.data) return [];

        return profilesQuery.data.map((item): ComboboxItem => {
            return {
                value: item.profile.userId,
                label: item.profile.username,
            };
        });
    }, [profilesQuery.data]);

    const grantAchievementMutation = useMutation({
        mutationFn: async () => {
            if (!selectedAchievementId) {
                throw new Error("An achievement must be selected first.");
            } else if (selectedUserIds.length === 0) {
                throw new Error("At least one user must be selected.");
            }

            await AchievementsService.achievementsControllerGrantAchievementsV1(
                {
                    achievementId: selectedAchievementId,
                    targetUserIds: selectedUserIds,
                },
            );
        },
        onError: (err) => {
            if (err instanceof ApiError) {
                notifications.show({
                    message: err.body.message,
                    color: "red",
                });
            } else {
                notifications.show({
                    color: "red",
                    message: err.message,
                });
            }
        },
        onSuccess: () => {
            notifications.show({
                message:
                    "Successfully granted achievements to all selected users!",
                color: "green",
            });
        },
    });

    return (
        <Paper className={"!bg-[#181818] p-4"}>
            <Stack className={"w-full"}>
                <MultiSelect
                    label={"Select users"}
                    description={"You can search a user by typing its username"}
                    data={buildUserOptions()}
                    value={selectedUserIds}
                    onChange={(v) => {
                        if (v) {
                            setSelectedUserIds(v);
                        }
                    }}
                    searchable
                    limit={20}
                    withCheckIcon
                    nothingFoundMessage="Nothing found..."
                />
                <Select
                    value={selectedAchievementId}
                    onChange={(v) => {
                        if (v) {
                            setSelectedAchievementId(v);
                        }
                    }}
                    label={"Select a achievement"}
                    description={
                        "You can search by typing a achievement's name"
                    }
                    className={"w-full"}
                    data={buildAchievementsOptions()}
                    searchable
                    clearable={false}
                    withCheckIcon
                />
                {userId && getSelectedAchievement() && (
                    <AchievementItem
                        targetUserId={userId}
                        achievement={getSelectedAchievement()}
                    />
                )}
                <Button
                    className={"my-4"}
                    onClick={() => {
                        grantAchievementMutation.mutate();
                    }}
                    disabled={
                        selectedUserIds.length === 0 ||
                        !getSelectedAchievement()
                    }
                    loading={grantAchievementMutation.isPending}
                >
                    Grant achievement
                </Button>
            </Stack>
        </Paper>
    );
};

export default AchievementsGrantView;
