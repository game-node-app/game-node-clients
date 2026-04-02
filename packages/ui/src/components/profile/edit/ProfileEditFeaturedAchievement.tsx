import React, { useEffect, useMemo, useState } from "react";
import { Button, Center, Stack, Text, UnstyledButton } from "@mantine/core";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { AchievementItem } from "#@/components/achievement/AchievementItem";
import { useAllObtainedAchievements } from "#@/components/achievement/hooks/useAllObtainedAchievements";
import { useMutation } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { AchievementsService } from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";
import { createErrorNotification, Modal } from "#@/util";
import { ProfileFeaturedAchievements } from "#@/components/profile/view/ProfileFeaturedAchievements.tsx";
import { AchievementsMultiSelect } from "#@/components/achievement/select/AchievementsMultiSelect.tsx";
import { DetailsBox } from "#@/components";
import { useTranslation } from "@repo/locales";

const ProfileEditFeaturedAchievement = () => {
  const { t } = useTranslation();
  const [opened, modalUtils] = useDisclosure(false);
  const [selectedAchievementIds, setSelectedAchievementIds] = useState<
    string[]
  >([]);

  const userId = useUserId();
  const obtainedAchievementsQuery = useAllObtainedAchievements(userId);
  const featuredAchievements = useMemo(() => {
    if (obtainedAchievementsQuery.data == undefined) {
      return [];
    }

    return obtainedAchievementsQuery.data.filter((oa) => oa.isFeatured);
  }, [obtainedAchievementsQuery.data]);

  const featuredAchievementMutation = useMutation({
    mutationFn: async () => {
      return AchievementsService.achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2(
        {
          featuredAchievementIds: selectedAchievementIds,
        },
      );
    },
    onSuccess: () => {
      notifications.show({
        message: t("profile.messages.achievementsUpdated"),
      });
    },
    onError: createErrorNotification,
    onSettled: () => {
      obtainedAchievementsQuery.invalidate();
    },
  });

  // Effect to sync featured achievements with selection
  useEffect(() => {
    if (featuredAchievements.length > 0) {
      setSelectedAchievementIds(
        featuredAchievements.map((achievement) => achievement.achievementId),
      );
    }
  }, [featuredAchievements]);

  if (!userId) {
    return null;
  }

  return (
    <Stack className={"w-full"}>
      <Modal
        opened={opened}
        onClose={modalUtils.close}
        title={t("profile.titles.selectAchievements")}
      >
        {obtainedAchievementsQuery.data ? (
          <Stack className={"w-full"}>
            <AchievementsMultiSelect
              achievements={obtainedAchievementsQuery.data.map(
                (oa) => oa.achievement,
              )}
              value={selectedAchievementIds}
              onChange={(ids) => {
                setSelectedAchievementIds(ids);
              }}
            />
            <Center className={"mb-8"}>
              <Button
                loading={featuredAchievementMutation.isPending}
                onClick={() => featuredAchievementMutation.mutate()}
              >
                {t("actions.save")}
              </Button>
            </Center>
            <DetailsBox title={t("profile.collections.featured")}>
              {featuredAchievements.map((featuredAchievement) => {
                return (
                  <AchievementItem
                    key={`featured-${featuredAchievement.achievementId}`}
                    targetUserId={userId}
                    achievement={featuredAchievement.achievement}
                  />
                );
              })}
            </DetailsBox>
          </Stack>
        ) : (
          <Text>{t("profile.messages.noAchievements")}</Text>
        )}
      </Modal>
      <UnstyledButton onClick={modalUtils.open}>
        <ProfileFeaturedAchievements targetUserId={userId} withEmptyMessage />
      </UnstyledButton>
    </Stack>
  );
};

export { ProfileEditFeaturedAchievement };
