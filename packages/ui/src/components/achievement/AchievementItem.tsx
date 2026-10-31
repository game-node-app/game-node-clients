import React from "react";
import {
  Group,
  Paper,
  Popover,
  Progress,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { AchievementProgressDto, AchievementV2Dto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { AchievementBadge } from "./AchievementBadge";

interface Props {
  achievement: AchievementV2Dto;
  progress?: AchievementProgressDto;
}

const AchievementItem = ({ achievement, progress }: Props) => {
  const { t } = useTranslation();
  const tier = progress?.tier ?? 0;
  const value = progress?.value ?? 0;
  const isSecret = achievement.name == null;
  const nextThreshold = progress
    ? progress.nextThreshold
    : (achievement.tiers[0]?.threshold ?? null);
  const isComplete = nextThreshold == null && tier > 0;
  const nextTier = achievement.tiers.find((it) => it.level === tier + 1);

  return (
    <Paper
      className={
        "border-[#282828] bg-paper data-[obtained=true]:bg-[#222222] border-2 rounded-md"
      }
      w={"100%"}
      withBorder
      data-obtained={tier > 0 ? "true" : "false"}
    >
      <Group wrap={"nowrap"} w={"100%"} px={"1rem"} py={"1.5rem"}>
        <AchievementBadge icon={achievement.icon} tier={tier} />
        <Stack gap={"0.5rem"} className={"grow"}>
          <Title fz={"1rem"}>
            {isSecret ? t("achievements.labels.secret") : achievement.name}
          </Title>
          <Text fz={"0.85rem"} className={"break-words"}>
            {isSecret
              ? t("achievements.labels.secretDescription")
              : achievement.description}
          </Text>
          {!isSecret &&
            (isComplete ? (
              <Group gap={4}>
                <IconCheck size={16} />
                <Text fz={"0.85rem"}>{t("achievements.labels.complete")}</Text>
              </Group>
            ) : (
              nextThreshold != null && (
                <Stack gap={2}>
                  <Progress value={(value / nextThreshold) * 100} />
                  <Text fz={"0.75rem"}>
                    {t("achievements.labels.progress", {
                      value,
                      threshold: nextThreshold,
                    })}
                    {nextTier &&
                      ` · ${t("achievements.labels.nextReward", { xp: nextTier.expReward })}`}
                  </Text>
                </Stack>
              )
            ))}
          {!isSecret && (
            <Popover withArrow>
              <Popover.Target>
                <UnstyledButton className={"text-xs underline w-fit"}>
                  {t("achievements.labels.tiers")}
                </UnstyledButton>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap={4}>
                  {achievement.tiers.map((it) => (
                    <Group key={it.level} gap={6} wrap={"nowrap"}>
                      <IconCheck
                        size={14}
                        opacity={it.level <= tier ? 1 : 0.15}
                      />
                      <Text fz={"0.8rem"}>
                        {t("achievements.labels.tier", { level: it.level })}
                        {" · "}
                        {t("achievements.labels.tierRow", {
                          threshold: it.threshold,
                          xp: it.expReward,
                          rarity: (it.rarity * 100).toFixed(1),
                        })}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Popover.Dropdown>
            </Popover>
          )}
        </Stack>
      </Group>
    </Paper>
  );
};

export { AchievementItem };
