import React, { useCallback, useMemo } from "react";
import {
  Group,
  GroupProps,
  HoverCard,
  Image,
  ImageProps,
  Popover,
  Skeleton,
  Text,
} from "@mantine/core";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import { getGamePlatformInfo } from "#@/components/game/util/getGamePlatformInfo";
import { useGame } from "#@/components/game/hooks/useGame";
import { DEFAULT_GAME_INFO_VIEW_DTO } from "#@/components/game/info/GameInfoView";
import { useGamePlatformIcons } from "#@/components";
import { useTranslation } from "@repo/locales";
import { cn } from "#@/util/cn.ts";

interface IGameInfoPlatformsProps extends GroupProps {
  gameId: number | undefined;
  iconsProps?: ImageProps;
  withNotAvailableText?: boolean;
}

const GameInfoPlatforms = ({
  gameId,
  iconsProps,
  withNotAvailableText = true,
  ...others
}: IGameInfoPlatformsProps) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const gameQuery = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);
  const iconsQuery = useGamePlatformIcons(gameId);

  const buildIconsSkeletons = useCallback(() => {
    return new Array(4).fill(0).map((_, i) => {
      return <Skeleton key={i} className={"h-[40px] w-[56px]"} />;
    });
  }, []);

  const icons = useMemo(() => {
    const icons = iconsQuery.data;
    if (!icons) return null;
    return icons.map((icon) => {
      return (
        <Image
          key={icon}
          w={40}
          alt={icon}
          src={getServerStoredIcon(icon)}
          {...iconsProps}
        />
      );
    });
  }, [iconsProps, iconsQuery.data]);

  const isEmpty = icons == undefined || icons.length === 0;
  const platformInfo = getGamePlatformInfo(gameQuery.data);
  const platformsNames = platformInfo.platformsAbbreviations?.join(", ");

  const TargetPopoverElement = onMobile ? Popover : HoverCard;

  if (isEmpty && !withNotAvailableText) {
    return null;
  }

  return (
    <TargetPopoverElement shadow={"md"}>
      <TargetPopoverElement.Target>
        <Group
          {...others}
          className={cn(
            "max-w-fit w-fit flex-wrap justify-start",
            {
              "justify-center": onMobile,
            },
            others.className,
          )}
        >
          {iconsQuery.isLoading ? buildIconsSkeletons() : icons}
          {!iconsQuery.isLoading && isEmpty && t("game.details.notAvailable")}
        </Group>
      </TargetPopoverElement.Target>
      <TargetPopoverElement.Dropdown>
        <Text fz={"sm"}>
          {platformsNames ?? t("game.details.notAvailable")}
        </Text>
      </TargetPopoverElement.Dropdown>
    </TargetPopoverElement>
  );
};

export { GameInfoPlatforms };
