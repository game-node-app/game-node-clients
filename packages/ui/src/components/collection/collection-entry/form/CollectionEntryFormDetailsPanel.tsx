import {
  CollectionEntryPlatformSelect,
  CollectionEntryStatusSelect,
  DEFAULT_GAME_INFO_VIEW_DTO,
  GameCoverPickerModal,
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
  ActionIcon,
  Button,
  ComboboxItem,
  Divider,
  Group,
  MultiSelect,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { Collection, GamePlatform } from "@repo/wrapper/server";
import { IconPhotoEdit } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";

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
  const { t } = useTranslation();
  const {
    watch,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<TGameAddOrUpdateValues>();

  const onMobile = useOnMobile();

  const [coverPickerOpened, coverPickerUtils] = useDisclosure();

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
      {game != undefined && (
        <GameCoverPickerModal
          opened={coverPickerOpened}
          onClose={coverPickerUtils.close}
          game={game}
        />
      )}
      {showGameInfo && (
        <Stack className="w-full items-center justify-start flex-shrink">
          <GameFigureImage game={game!} imageSize={ImageSize.COVER_BIG_2X} />
          <Button
            type="button"
            variant="default"
            size="xs"
            leftSection={<IconPhotoEdit size={"1rem"} />}
            onClick={coverPickerUtils.open}
          >
            {t("game.coverPicker.open")}
          </Button>
        </Stack>
      )}
      <Divider
        orientation={onMobile ? "horizontal" : "vertical"}
        className={"w-full lg:w-fit"}
      />
      <Stack className={"w-full items-start gap-2 h-full lg:flex-grow"}>
        <Group
          justify="space-between"
          align="center"
          wrap="nowrap"
          className="w-full"
        >
          <Title size={"h5"}>{game?.name}</Title>
          {!showGameInfo && (
            <Tooltip label={t("game.coverPicker.open")}>
              <ActionIcon
                type="button"
                variant="default"
                size="md"
                aria-label={t("game.coverPicker.open")}
                onClick={coverPickerUtils.open}
              >
                <IconPhotoEdit size={"1rem"} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
        <CollectionEntryPlatformSelect gameId={gameId} />
        <MultiSelect
          {...register("collectionIds")}
          value={collectionsIdsValue}
          className={"w-full"}
          data={collectionOptions}
          onChange={(value) => {
            setValue("collectionIds", value);
          }}
          placeholder={t("collectionEntry.placeholders.collections")}
          label={t("collectionEntry.labels.collections")}
          error={errors.collectionIds?.message}
          searchable
          limit={10}
          description={t("collectionEntry.descriptions.collectionsOptional")}
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
            label={t("collectionEntry.labels.finishedDate")}
            description={t("collectionEntry.descriptions.finishedDateOptional")}
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