import React, { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Stack, Text } from "@mantine/core";
import {
  DEFAULT_GAME_INFO_VIEW_DTO,
  GamePlatformMultiSelect,
  IGameAddFormProps,
  TextLink,
  TGameAddOrUpdateValues,
  useGame,
  useOwnCollectionEntryForGameId,
  usePreferredPlatforms,
} from "#@/components";
import { useDisclosure } from "@mantine/hooks";
import { PreferredPlatformsViewModal } from "#@/components/preferred-platform/view/PreferredPlatformsViewModal";

const CollectionEntryPlatformSelect = ({
  gameId,
}: Pick<IGameAddFormProps, "gameId">) => {
  const {
    watch,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<TGameAddOrUpdateValues>();

  const collectionEntryQuery = useOwnCollectionEntryForGameId(gameId);

  const [preferredPlatformsModalOpened, preferredPlatformsModalUtils] =
    useDisclosure();

  const { data: preferredPlatforms } = usePreferredPlatforms();

  /**
   * We re-use the default DTO here because the query is probably already cached for it at this point
   */
  const gameQuery = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);

  const platforms = gameQuery.data?.platforms;

  const availablePlatforms = useMemo(
    () => platforms?.map((platform) => platform.id) ?? [],
    [platforms],
  );

  const platformsIdsValue = watch("platformsIds");

  const isInLibrary =
    !collectionEntryQuery.isLoading && collectionEntryQuery.data != null;

  const hasPreferredPlatforms =
    preferredPlatforms != undefined && preferredPlatforms.length > 0;

  useEffect(() => {
    if (!isInLibrary && hasPreferredPlatforms) {
      const matchingPlatformsForGame = preferredPlatforms.filter((pp) =>
        availablePlatforms.includes(pp.platformId),
      );

      setValue(
        "platformsIds",
        matchingPlatformsForGame.map((pp) => pp.platformId),
      );
    }
  }, [
    availablePlatforms,
    hasPreferredPlatforms,
    isInLibrary,
    preferredPlatforms,
    setValue,
  ]);

  return (
    <Stack className="w-full gap-1">
      <PreferredPlatformsViewModal
        opened={preferredPlatformsModalOpened}
        onClose={preferredPlatformsModalUtils.close}
      />

      <GamePlatformMultiSelect
        {...register("platformsIds")}
        value={platformsIdsValue || []}
        targetPlatformIds={availablePlatforms}
        className={"w-full"}
        onChange={(value) => {
          setValue("platformsIds", value ?? []);
        }}
        searchable
        placeholder={"Select platforms"}
        label={"Platforms"}
        error={errors.platformsIds?.message}
        withAsterisk
        limit={20}
        description={"You can search for a platform by typing it's name"}
      />
      {!isInLibrary && (
        <Text className={"text-sm text-dimmed"}>
          Tip:{" "}
          <TextLink
            href={"#"}
            onClick={(evt) => {
              evt.preventDefault();
              preferredPlatformsModalUtils.open();
            }}
          >
            set your preferred platforms
          </TextLink>{" "}
          to fill this field automatically when adding new games.
        </Text>
      )}
    </Stack>
  );
};

export { CollectionEntryPlatformSelect };
