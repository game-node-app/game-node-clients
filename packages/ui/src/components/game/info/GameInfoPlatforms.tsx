import React, { useCallback, useMemo } from "react";
import {
  Group,
  GroupProps,
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

interface IGameInfoPlatformsProps extends GroupProps {
  gameId: number | undefined;
  iconsProps?: ImageProps;
}

const GameInfoPlatforms = ({
  gameId,
  iconsProps,
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
  return (
    <Popover shadow={"md"}>
      <Popover.Target>
        <Group
          w={"100%"}
          justify={onMobile ? "center" : "start"}
          wrap={"wrap"}
          {...others}
        >
          {iconsQuery.isLoading ? buildIconsSkeletons() : icons}
          {!iconsQuery.isLoading && isEmpty && t("game.details.notAvailable")}
        </Group>
      </Popover.Target>
      <Popover.Dropdown>
        <Text fz={"sm"}>
          {platformsNames ?? t("game.details.notAvailable")}
        </Text>
      </Popover.Dropdown>
    </Popover>
  );
};

export { GameInfoPlatforms };
