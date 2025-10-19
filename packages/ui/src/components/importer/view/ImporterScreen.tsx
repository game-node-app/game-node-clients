import {
  Box,
  Button,
  Center,
  Flex,
  Group,
  Image,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import React, { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  EMatomoEventAction,
  EMatomoEventCategory,
  getErrorMessage,
  getPageAsOffset,
  getServerStoredIcon,
  trackMatomoEvent,
} from "#@/util";
import {
  CollectionsEntriesService,
  CreateUpdateCollectionEntryDto,
  ImporterService,
} from "@repo/wrapper/server";
import {
  CenteredErrorMessage,
  GameSelectView,
  ImporterCollectionSelect,
  useGames,
  useImporterEntries,
  useUserId,
  useUserLibrary,
} from "#@/components";
import status = CreateUpdateCollectionEntryDto.status;

const ImporterFormSchema = z.object({
  selectedCollectionIds: z.array(z.string()),
  selectedGameIds: z.array(z.number()).min(1, "Select at least one game."),
  page: z.number(),
});

type ImporterFormValues = z.infer<typeof ImporterFormSchema>;

const DEFAULT_LIMIT = 20;

interface Props {
  source: string;
}

const ImporterScreen = ({ source }: Props) => {
  const userId = useUserId();

  const {
    watch,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ImporterFormValues>({
    mode: "onBlur",
    resolver: zodResolver(ImporterFormSchema),
    defaultValues: {
      page: 1,
      selectedCollectionIds: [],
      selectedGameIds: [],
    },
  });

  const selectedGameIds = watch("selectedGameIds");
  const page = watch("page");

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  const importerEntriesQuery = useImporterEntries({
    source: source,
    limit: DEFAULT_LIMIT,
    offset: getPageAsOffset(page, DEFAULT_LIMIT),
    search: searchQuery,
  });

  const gameIds = importerEntriesQuery.data?.data.map(
    (externalGame) => externalGame.gameId,
  );

  const gamesQuery = useGames(
    {
      gameIds,
      relations: {
        cover: true,
      },
    },
    false,
  );
  const isLoading = importerEntriesQuery.isLoading || gamesQuery.isLoading;
  const isError = importerEntriesQuery.isError || gamesQuery.isError;
  const isEmpty =
    !isLoading &&
    !isError &&
    (importerEntriesQuery.data == undefined ||
      importerEntriesQuery.data.data.length === 0);

  const error = importerEntriesQuery.error || gamesQuery.error;

  const isAllGamesSelected =
    gameIds != undefined && selectedGameIds.length === gameIds.length;

  const buildLoadingSkeletons = useCallback(() => {
    return new Array(10).fill(0).map((v, i) => {
      return <Skeleton key={i} className={"w-full h-48 mt-4"} />;
    });
  }, []);

  const resetSelectedGames = () => {
    setValue("selectedGameIds", []);
  };

  const handleSelection = (gameId: number) => {
    const indexOfElement = selectedGameIds.indexOf(gameId);
    const isAlreadyPresent = indexOfElement > -1;

    if (isAlreadyPresent) {
      const updatedArray = selectedGameIds.toSpliced(indexOfElement, 1);
      setValue("selectedGameIds", updatedArray);
      return;
    }

    setValue("selectedGameIds", selectedGameIds.concat([gameId]));
  };

  const removeExcludedItemMutation = useMutation({
    mutationFn: async (gameId: number) => {
      const externalGame = importerEntriesQuery.data?.data.find(
        (externalGame) => {
          return externalGame.gameId === gameId;
        },
      );

      if (!externalGame) {
        throw new Error(
          "Error while inserting game. Invalid external game ID. Please contact support.",
        );
      }

      await ImporterService.importerControllerChangeStatusV1({
        externalGameId: externalGame.id,
        status: "ignored",
      });

      return gameId;
    },
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: `Successfully excluded item already in your library.`,
      });
    },
    onSettled: () => {
      importerEntriesQuery.invalidate();
      gamesQuery.invalidate();
    },
  });

  const importMutation = useMutation({
    mutationFn: async ({
      selectedCollectionIds,
      selectedGameIds,
    }: ImporterFormValues) => {
      const importedGameIds: number[] = [];
      for (const selectedGameId of selectedGameIds) {
        const importerItem = importerEntriesQuery.data?.data.find(
          (externalGame) => {
            return externalGame.gameId === selectedGameId;
          },
        );

        if (!importerItem) {
          throw new Error(
            "Error while inserting game. Invalid external game ID. Please contact support.",
          );
        }

        await CollectionsEntriesService.collectionsEntriesControllerCreateOrUpdateV1(
          {
            gameId: selectedGameId,
            collectionIds: selectedCollectionIds,
            platformIds: [importerItem.preferredPlatformId],
            status: status.PLANNED,
          },
        );
        await ImporterService.importerControllerChangeStatusV1({
          externalGameId: importerItem.id,
          status: "processed",
        });
        importedGameIds.push(selectedGameId);
      }

      return importedGameIds.length;
    },
    onSuccess: (importedGamesCount) => {
      notifications.show({
        color: "green",
        message: `Successfully imported ${importedGamesCount} games to your library!`,
      });
      trackMatomoEvent(
        EMatomoEventCategory.Importer,
        EMatomoEventAction.Create,
        `Imported ${importedGamesCount} games from source ${source}`,
      );
      resetSelectedGames();
    },
    onSettled: () => {
      importerEntriesQuery.invalidate();
      gamesQuery.invalidate();
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        message: `Error while importing games: ${err.message}`,
      });
    },
  });

  return (
    <Flex justify={"center"} p={0} wrap={"wrap"}>
      <form
        className={"w-full flex flex-col w-full lg:w-10/12 p-4"}
        onSubmit={handleSubmit((data) => {
          importMutation.mutate(data);
        })}
      >
        <Group className={"w-full border-[#302D2D] border-2 py-2 px-4"}>
          <Group className={"w-full lg:w-6/12 flex-nowrap"}>
            <Image src={getServerStoredIcon(source)} w={48} h={48} />
            <Stack gap={4}>
              <Title size={"h4"}>
                GAME <span className={"text-[#F15025]"}>IMPORTER</span>
              </Title>
              <Text>
                Select one or multiple games which you want to bring to your
                GameNode library.
              </Text>
            </Stack>
          </Group>
          <Stack className={"w-full lg:ms-auto lg:w-4/12"}>
            <ImporterCollectionSelect
              userId={userId}
              onChange={(values) => {
                setValue("selectedCollectionIds", values);
              }}
              error={errors.selectedCollectionIds?.message}
              description={"Optional"}
            />
          </Stack>
          <Center w={"100%"}>
            <Button
              type={"submit"}
              loading={importMutation.isPending}
              disabled={isLoading || isError || isEmpty}
            >
              Import
            </Button>
          </Center>
          {errors.selectedGameIds != undefined && (
            <CenteredErrorMessage message={errors.selectedGameIds.message!} />
          )}
        </Group>
        <Stack className={"mt-4 w-full grow"}>
          {isError && error && (
            <CenteredErrorMessage message={getErrorMessage(error)} />
          )}
          {isEmpty && (
            <CenteredErrorMessage
              message={
                "No items available for importing. Check if your library at the target platform is set to public."
              }
            />
          )}
          <GameSelectView>
            {!isEmpty && (
              <Group className={"items-end"}>
                <GameSelectView.Actions
                  isAllGamesSelected={isAllGamesSelected}
                  onSelectAll={() => {
                    if (isAllGamesSelected) {
                      resetSelectedGames();
                    } else if (gameIds) {
                      setValue("selectedGameIds", gameIds);
                    }
                  }}
                />
                <GameSelectView.SearchBar
                  onSearch={(query) => {
                    setValue("page", 1);
                    setSearchQuery(query);
                  }}
                  onClear={() => setSearchQuery(undefined)}
                />
              </Group>
            )}
            <GameSelectView.Content
              items={gamesQuery.data!}
              checkIsSelected={(gameId) => {
                return selectedGameIds.includes(gameId);
              }}
              onSelected={(gameId) => handleSelection(gameId)}
              excludeItemsInLibrary={true}
              onExcludedItemClick={removeExcludedItemMutation.mutate}
            >
              {isLoading && buildLoadingSkeletons()}
            </GameSelectView.Content>
            {!isEmpty && (
              <Box className={"mt-auto"}>
                <GameSelectView.Pagination
                  paginationInfo={importerEntriesQuery.data?.pagination}
                  page={page}
                  onPaginationChange={(selectedPage) => {
                    setValue("page", selectedPage);
                    resetSelectedGames();
                  }}
                />
              </Box>
            )}
          </GameSelectView>
        </Stack>
      </form>
    </Flex>
  );
};

export { ImporterScreen };
