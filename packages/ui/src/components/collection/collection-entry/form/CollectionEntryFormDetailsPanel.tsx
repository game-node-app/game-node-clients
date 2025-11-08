import React, { useEffect, useMemo } from "react";
import {
  CollectionEntryPlatformSelect,
  CollectionEntryStatusSelect,
  DEFAULT_GAME_INFO_VIEW_DTO,
  GameFigureImage,
  IGameAddFormProps,
  ImageSize,
  TGameAddOrUpdateValues,
  useGame,
  useGamesResource,
  useOnMobile,
  useOwnCollectionEntryForGameId,
  useUserId,
  useUserLibrary,
} from "#@/components";
import {
  ComboboxItem,
  Divider,
  Group,
  MultiSelect,
  Stack,
  Title,
} from "@mantine/core";
import { useFormContext } from "react-hook-form";
import { DatePickerInput } from "@mantine/dates";
import { Collection, GamePlatform } from "@repo/wrapper/server";
import dayjs from "dayjs";

function buildCollectionOptions(
  collections: Collection[] | undefined,
): ComboboxItem[] {
  if (collections == undefined || collections.length === 0) {
    return [];
  }

  return collections.map((collection) => {
    return {
      label: collection.name,
      value: collection.id,
      enabled: true,
    };
  });
}

function buildPlatformsOptions(
  platforms: GamePlatform[] | undefined,
): ComboboxItem[] | undefined {
  if (platforms == undefined || platforms.length === 0) return undefined;
  return platforms
    .filter(
      (platform) =>
        platform.abbreviation != undefined || platform.name != undefined,
    )
    .map((platform) => {
      return {
        label: platform.abbreviation ?? platform.name,
        value: `${platform.id}`,
      };
    });
}

const CollectionEntryFormDetailsPanel = ({
  gameId,
  showGameInfo,
}: Omit<IGameAddFormProps, "onClose">) => {
  const {
    watch,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<TGameAddOrUpdateValues>();

  const onMobile = useOnMobile();

  const collectionEntryQuery = useOwnCollectionEntryForGameId(gameId);

  /**
   * We re-use the default DTO here because the query is probably already cached for it at this point
   */
  const gameQuery = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);
  const gamePlatformsQuery = useGamesResource("platforms");

  const game = gameQuery.data;
  const userId = useUserId();

  const userLibraryQuery = useUserLibrary(userId);

  const collectionOptions = useMemo(() => {
    return buildCollectionOptions(userLibraryQuery?.data?.collections);
  }, [userLibraryQuery?.data?.collections]);

  const platformOptions = useMemo(() => {
    if (game && game.platforms != undefined && game.platforms.length > 0) {
      return buildPlatformsOptions(game.platforms);
    }
    return buildPlatformsOptions(gamePlatformsQuery.data);
  }, [game, gamePlatformsQuery.data]);

  const collectionsIdsValue = watch("collectionIds", []);
  const finishedAtDate = watch("finishedAt");
  const status = watch("status");

  /**
   * Effect to sync with user's collection data.
   */
  useEffect(() => {
    const collectionEntry = collectionEntryQuery.data;
    if (collectionEntry != undefined) {
      const finishedDate = collectionEntry.finishedAt
        ? new Date(collectionEntry.finishedAt)
        : null;

      setValue("finishedAt", finishedDate);
      const collectionIds = collectionEntry.collections.map(
        (collection) => collection.id,
      );
      setValue("status", collectionEntry.status);

      if (platformOptions && platformOptions.length > 0) {
        const platformIds = collectionEntry.ownedPlatforms.map(
          (platform) => platform.id,
        );
        const uniquePlatformIds = Array.from(new Set(platformIds));
        setValue("platformsIds", uniquePlatformIds);
      }
      setValue("collectionIds", collectionIds);
    }
  }, [collectionEntryQuery.data, platformOptions, setValue]);

  return (
    <Group className={"flex-wrap lg:flex-nowrap lg:items-start w-full h-full "}>
      {showGameInfo && (
        <Stack className="w-full items-center justify-start lg:w-1/2">
          <GameFigureImage game={game!} imageSize={ImageSize.COVER_BIG_2X} />
        </Stack>
      )}
      <Divider
        orientation={onMobile ? "horizontal" : "vertical"}
        className={"w-full lg:w-fit"}
      />
      <Stack className={"w-full items-start gap-2 h-full lg:w-1/2"}>
        <Title size={"h5"}>{game?.name}</Title>
        <CollectionEntryPlatformSelect gameId={gameId} />
        <MultiSelect
          {...register("collectionIds")}
          value={collectionsIdsValue}
          className={"w-full"}
          data={collectionOptions}
          onChange={(value) => {
            setValue("collectionIds", value);
          }}
          placeholder={"Select collections"}
          label={"Collections"}
          error={errors.collectionIds?.message}
          searchable
          limit={10}
          description={"Optional. Which collections do you want to save it on?"}
        />
        <CollectionEntryStatusSelect
          selectedCollectionIds={collectionsIdsValue}
          value={status}
          onChange={(v) => setValue("status", v as never)}
        />
        {status === "finished" && (
          <DatePickerInput
            {...register("finishedAt")}
            className={"w-full"}
            error={errors.finishedAt?.message}
            label={"Finished date"}
            description={"Optional. Leave empty if you don't remember."}
            onChange={(date) => {
              setValue("finishedAt", date ? dayjs(date).toDate() : null);
            }}
            value={finishedAtDate}
            clearable
            maxDate={new Date()}
          />
        )}
      </Stack>
    </Group>
  );
};

export { CollectionEntryFormDetailsPanel };
