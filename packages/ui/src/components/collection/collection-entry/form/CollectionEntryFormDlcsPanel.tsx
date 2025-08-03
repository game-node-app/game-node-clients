import React, { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_GAME_INFO_VIEW_DTO,
  DEFAULT_RELATED_GAMES_DTO,
  GameSelectView,
  IGameAddFormProps,
  TGameAddOrUpdateValues,
  useGame,
} from "#@/components";
import { Stack, Text, Title } from "@mantine/core";
import { Game } from "@repo/wrapper/server";
import { useFormContext } from "react-hook-form";

const CollectionEntryFormDlcsPanel = ({
  gameId,
}: Pick<IGameAddFormProps, "gameId">) => {
  const { watch, setValue } = useFormContext<TGameAddOrUpdateValues>();

  const gameQuery = useGame(gameId, DEFAULT_RELATED_GAMES_DTO);

  const selectedGameIds = watch("relatedGamesIds");

  const relatedGames = useMemo(() => {
    if (gameQuery.data == undefined) {
      return [];
    }

    const targetProperties: (keyof Game)[] = ["dlcs", "expansions"];

    return targetProperties
      .map((property) => gameQuery.data![property])
      .flat(1) as Game[];
  }, [gameQuery.data]);

  const onSelected = useCallback(
    (gameId: number) => {
      const existingIndex = selectedGameIds.indexOf(gameId);
      if (existingIndex !== -1) {
        const updatedArray = selectedGameIds.toSpliced(existingIndex, 1);
        setValue("relatedGamesIds", updatedArray);
        return;
      }

      setValue("relatedGamesIds", selectedGameIds.concat(gameId));
    },
    [selectedGameIds, setValue],
  );

  return (
    <Stack>
      <Title size={"h4"}>Add related content to this game</Title>
      <Text className={"text-dimmed text-sm"}>
        These items will be added to your library alongside this game. They will
        only be visible when visiting your entry&#39;s detail page. They will
        inherit this game&#39;s status and platforms, but will not be added to
        collections. You can always add them to your collections manually later.
      </Text>
      <GameSelectView>
        <GameSelectView.Actions
          onSelectAll={() => {
            const relatedGameIds = relatedGames.map((game) => game.id);
            if (selectedGameIds.length === relatedGameIds.length) {
              setValue("relatedGamesIds", []);
              return;
            }

            setValue("relatedGamesIds", relatedGameIds);
          }}
          isAllGamesSelected={selectedGameIds.length === relatedGames.length}
        ></GameSelectView.Actions>
        <GameSelectView.Content
          items={relatedGames}
          onSelected={onSelected}
          checkIsSelected={(gameId) => {
            return selectedGameIds.includes(gameId);
          }}
          excludeItemsInLibrary={true}
        />
      </GameSelectView>
    </Stack>
  );
};

export { CollectionEntryFormDlcsPanel };
