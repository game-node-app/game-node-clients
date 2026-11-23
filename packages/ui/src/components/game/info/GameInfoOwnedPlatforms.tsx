import { useOwnCollectionEntryForGameId } from "#@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { useOwnedPlatformIcons } from "#@/components/game/hooks/useOwnedPlatformIcons";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import {
  Group,
  GroupProps,
  Image,
  ImageProps,
  Popover,
  Skeleton,
  Text,
} from "@mantine/core";
import { useCallback, useMemo } from "react";

interface IGameInfoOwnedPlatformsProps extends GroupProps {
  gameId: number | undefined;
  iconsProps?: ImageProps;
}

const GameInfoOwnedPlatforms = ({
  gameId,
  iconsProps,
  ...others
}: IGameInfoOwnedPlatformsProps) => {
  const onMobile = useOnMobile();
  const collectionEntry = useOwnCollectionEntryForGameId(gameId);
  const iconsQuery = useOwnedPlatformIcons(gameId, collectionEntry.data);

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
          w={60}
          alt={icon}
          src={getServerStoredIcon(icon)}
          {...iconsProps}
        />
      );
    });
  }, [iconsProps, iconsQuery.data]);

  const isEmpty = icons == undefined || icons.length === 0;
  const platformsNames = collectionEntry.data?.ownedPlatforms
    .map((platform) => {
      return platform.abbreviation;
    })
    .join(", ");
  return (
    <Popover shadow={"md"}>
      <Popover.Target>
        <Group
          w={"100%"}
          justify={onMobile ? "center" : "start"}
          wrap={"wrap"}
          {...others}
        >
          {!iconsQuery.isLoading && isEmpty && "Not available"}
          {iconsQuery.isLoading ? buildIconsSkeletons() : icons}
        </Group>
      </Popover.Target>
      <Popover.Dropdown>
        <Text fz={"sm"}>{platformsNames ?? "Not available"}</Text>
      </Popover.Dropdown>
    </Popover>
  );
};

export { GameInfoOwnedPlatforms };