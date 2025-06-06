import React, { useMemo, useState } from "react";
import {
  IGameFigureProps,
  GameFigureImage,
} from "#@/components/game/figure/GameFigureImage";
import { Box, Center, Overlay, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { useOwnCollectionEntryForGameId } from "#@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";

export interface GameSelectViewFigureProps extends IGameFigureProps {
  /**
   * Not to be confused with 'onSelect'!
   * @param gameId
   */
  onSelected: (gameId: number) => void;
  checkIsSelected: (gameId: number) => boolean;
  /**
   * If items already on user's library should not be available for selecting
   */
  excludeItemsInLibrary: boolean;
  /**
   * Function to execute when a excluded item is executed
   * Depends on 'excludeItemsInLibrary' being true for current item.
   */
  onExcludedItemClick?: (gameId: number) => void;
}

const GameSelectViewFigure = ({
  game,
  checkIsSelected,
  onSelected,
  excludeItemsInLibrary,
  onExcludedItemClick,
  ...figureProps
}: GameSelectViewFigureProps) => {
  /**
   * Passing 'undefined' disables this query
   */
  const collectionEntry = useOwnCollectionEntryForGameId(
    excludeItemsInLibrary ? game?.id : undefined,
  );

  const isInCollection = collectionEntry.data != undefined;

  const isExcluded = excludeItemsInLibrary && isInCollection;

  const isSelected = useMemo(() => {
    if (!game) return false;
    if (isExcluded) return false;
    return checkIsSelected(game.id!);
  }, [checkIsSelected, game, isExcluded]);

  const onClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    if (!game || !game.id) return;

    if (isExcluded) {
      if (onExcludedItemClick) {
        onExcludedItemClick(game.id);
      }
      return;
    }

    onSelected(game.id);
  };

  if (!game) return;

  return (
    <GameFigureImage {...figureProps} game={game} onClick={onClick}>
      {isSelected && (
        <>
          <Overlay color="#000" backgroundOpacity={0.85} className={"z-10"} />
          <Center
            className={
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            }
            onClick={onClick}
          >
            <IconCircleCheckFilled className={"text-brand-5"} />
          </Center>
        </>
      )}
      {isExcluded && (
        <>
          <Overlay color="#000" backgroundOpacity={0.85} className={"z-10"} />
          <Center
            className={
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center"
            }
            onClick={onClick}
          >
            <Stack className={"items-center gap-0.5"}>
              <IconCircleCheckFilled className={"w-8 h-8 z-20 text-brand-5"} />
              <Text className={"text-center"}>In your library</Text>
            </Stack>
          </Center>
        </>
      )}
    </GameFigureImage>
  );
};

export { GameSelectViewFigure };
