import React from "react";
import { BaseRecapStatsProps } from "#@/components/recap/stats/types";
import { useRecap } from "#@/components/recap/hooks/useRecap";
import { Group, HoverCard, Popover, Stack, Text, Title } from "@mantine/core";
import { useOnMobile } from "#@/components";
import { useTranslation } from "@repo/locales";

const RecapStatsPlaytime = ({ userId, targetYear }: BaseRecapStatsProps) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const TooltipWrapper = onMobile ? Popover : HoverCard;

  const { data: recap } = useRecap(userId, targetYear);
  const totalPlaytimeSeconds = Math.ceil(recap?.totalPlaytimeSeconds || 0);
  const totalPlaytimeMinutes = totalPlaytimeSeconds / 60;
  const totalPlaytimeHours = totalPlaytimeSeconds / 3600;
  const totalPlaytimeDays = totalPlaytimeSeconds / (3600 * 24);
  const totalPlaytimeWeeks = totalPlaytimeSeconds / (3600 * 24 * 7);
  const totalPlaytimeMonths = totalPlaytimeSeconds / (3600 * 24 * 30);
  return (
    <TooltipWrapper>
      <TooltipWrapper.Target>
        <Group className={"gap-2 "}>
          <Stack className={"items-center gap-1"}>
            <Title className={"text-8xl font-black text-white"}>
              {Math.ceil(totalPlaytimeHours)}
            </Title>
            <Text>{t("recap.labels.hoursPlayed")}</Text>
          </Stack>
          <Stack className={"gap-0.5"}>
            <Title className={"text-lg font-black text-white"}>
              {t("recap.stats.thisIs")}
            </Title>
            <Text className={"text-md"}>
              {t("recap.stats.minutes", {
                count: totalPlaytimeMinutes.toFixed(2),
              })}
            </Text>
            <Text className={"text-md"}>
              {t("recap.stats.days", { count: totalPlaytimeDays.toFixed(2) })}
            </Text>
            <Text className={"text-md"}>
              {t("recap.stats.weeks", { count: totalPlaytimeWeeks.toFixed(2) })}
            </Text>
            <Text className={"text-md"}>
              {t("recap.stats.months", {
                count: totalPlaytimeMonths.toFixed(2),
              })}
            </Text>
          </Stack>
        </Group>
      </TooltipWrapper.Target>
      <TooltipWrapper.Dropdown className={"max-w-60 lg:max-w-96"}>
        <Text>{t("recap.stats.dataNotePlatforms")}</Text>
      </TooltipWrapper.Dropdown>
    </TooltipWrapper>
  );
};

export { RecapStatsPlaytime };
