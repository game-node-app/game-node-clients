import React, { useCallback } from "react";
import {
  AspectRatio,
  Box,
  Flex,
  Group,
  Image,
  Overlay,
  Popover,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { match } from "ts-pattern";
import { GameAchievementDto } from "@repo/wrapper/server";
import {
  cn,
  GameAchievementsListItemProps,
  getServerStoredIcon,
} from "@repo/ui";
import { IonRippleEffect } from "@ionic/react";
import dayjs from "dayjs";

const MobileGameAchievementListItem = ({
  achievement,
}: GameAchievementsListItemProps) => {
  const renderRightSideDetail = useCallback(() => {
    return match(achievement.source)
      .with(GameAchievementDto.source._1, () => {
        const details = achievement.steamDetails;
        if (!details) return null;

        return (
          <Stack className={"gap-1"}>
            <Text className={"text-md text-center font-semibold"}>
              {details.globalPercentage}%
            </Text>
            <Text className={"text-center text-xs text-dimmed"}>Owned by</Text>
          </Stack>
        );
      })
      .with(GameAchievementDto.source._36, () => {
        const details = achievement.psnDetails;
        if (!details) return null;
        return (
          <AspectRatio ratio={1} className={"min-w-12 w-12 min-h-12 h-12"}>
            <Image
              src={getServerStoredIcon(details.trophyIcon)}
              alt={achievement.name + details.trophyType}
              className={"w-full h-full object-contain"}
            />
          </AspectRatio>
        );
      })
      .with(GameAchievementDto.source._11, () => {
        const details = achievement.xboxDetails;
        if (!details) return null;

        return (
          <Group className={"items-center gap-1"}>
            <Image
              src={getServerStoredIcon("xbox_achievement")}
              alt={"Gamerscore icon"}
              className={"w-10 h-10 object-contain"}
            />
            <Text className={"text-lg font-bold"}>{details.gamerScore}</Text>
          </Group>
        );
      })
      .otherwise(() => null);
  }, [achievement]);
  return (
    <Popover>
      <Popover.Target>
        <Group
          className={
            "bg-paper-2 rounded-md px-2 py-3.5 min-h-20 relative ion-activatable"
          }
        >
          <IonRippleEffect className={"rounded-md z-10"} />
          <Group className={"flex-nowrap gap-2 max-w-60"}>
            <AspectRatio
              ratio={1}
              className={"relative min-w-12 h-12 rounded-md"}
            >
              <Image
                className={"w-full h-full rounded-sm"}
                src={achievement.iconUrl}
                alt={achievement.name}
              />
              {!achievement.isObtained && (
                <Overlay
                  className={"z-0 rounded-md"}
                  color="#000"
                  backgroundOpacity={
                    achievement.source === GameAchievementDto.source._11
                      ? 0.45
                      : 0.55
                  }
                />
              )}
            </AspectRatio>
            <Stack className={"gap-2 justify-start min-h-12 "}>
              <Text
                className={cn("text-sm font-medium", {
                  "text-white": achievement.isObtained,
                })}
              >
                {achievement.name}
              </Text>
              <Text
                className={cn("text-xs", {
                  "text-white": achievement.isObtained,
                })}
              >
                {achievement.description}
              </Text>
            </Stack>
          </Group>
          <Flex className={"grow justify-end"}>{renderRightSideDetail()}</Flex>
        </Group>
      </Popover.Target>
      <Popover.Dropdown className={"max-w-60"}>
        <Stack>
          <Title order={5}>{achievement.name}</Title>
          {achievement.description && (
            <Text className={"text-dimmed"}>{achievement.description}</Text>
          )}
          {achievement.isObtained && (
            <Text className={"text-dimmed text-sm"}>
              Obtained at {dayjs(achievement.obtainedAt).format("LLL")}
            </Text>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export { MobileGameAchievementListItem };
