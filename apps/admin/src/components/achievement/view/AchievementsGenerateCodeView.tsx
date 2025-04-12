"use client";

import React, { useCallback, useState } from "react";
import {
  Button,
  Checkbox,
  ComboboxItem,
  Paper,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import useUserId from "@/components/auth/hooks/useUserId";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { AchievementItem, useAchievements } from "@repo/ui";
import { AchievementsCodeService } from "@repo/wrapper/server";

const AchievementsGenerateCodeView = () => {
  const userId = useUserId();

  const [generatedAchievementCode, setGeneratedAchievementCode] = useState<
    string | undefined
  >(undefined);

  const [selectedAchievementId, setSelectedAchievementId] = useState<
    string | undefined
  >(undefined);

  const [isSingleUse, setIsSingleUse] = useState(true);

  const achievementsQuery = useAchievements({ limit: 9999999 });

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

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAchievementId) {
        throw new Error("A achievement must be selected first.");
      }

      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const resp =
        await AchievementsCodeService.achievementsCodeControllerGenerateV1({
          achievementId: selectedAchievementId,
          expiresAt: threeDaysFromNow.toISOString(),
          isSingleUse: isSingleUse,
        });

      setGeneratedAchievementCode(resp.code);

      return resp;
    },

    onError: (err) => {
      notifications.show({
        message: err.message,
        color: "red",
      });
    },

    onSuccess: (data) => {
      notifications.show({
        message:
          "Successfully generated code! Make sure to write it down, as it will not be shown again.",
        color: "green",
        autoClose: 15000,
      });
    },
  });

  return (
    <Paper className={"!bg-[#181818] p-4"}>
      <Stack className={"w-full h-full items-center"}>
        <Select
          value={selectedAchievementId}
          onChange={(v) => {
            if (v) {
              setSelectedAchievementId(v);
            }
          }}
          label={"Select a achievement"}
          description={"You can search by typing a achievement's name"}
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
        <Checkbox
          label={"Single use"}
          description={"If this code can only be used one time by one user."}
          checked={isSingleUse}
          onChange={(event) => setIsSingleUse(event.currentTarget.checked)}
        />
        <Button
          className={"my-4"}
          onClick={() => {
            generateCodeMutation.mutate();
          }}
          loading={generateCodeMutation.isPending}
          disabled={
            selectedAchievementId == undefined || generateCodeMutation.isPending
          }
        >
          Generate code
        </Button>

        {generatedAchievementCode && (
          <Stack className={"w-full"}>
            <Paper className={"bg-[#111111] py-6 px-12 w-full"}>
              <Text className={"text-center text-xl"}>
                {generatedAchievementCode}
              </Text>
            </Paper>
            <Text className={"text-dimmed text-sm text-center"}>
              Make sure to write it down, as it will not be shown again. This
              code will expire in 3 days.
            </Text>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default AchievementsGenerateCodeView;
