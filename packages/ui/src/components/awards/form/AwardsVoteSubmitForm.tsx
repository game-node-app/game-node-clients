import React, { useMemo, useState } from "react";
import { Progress, Stack, Text } from "@mantine/core";
import {
  buildGameCategoryFilters,
  CenteredLoading,
  DetailsBox,
  GameSearchViewActions,
  GameSelectView,
  useAwardEvent,
  useGames,
  useSearchGames,
  useUserId,
} from "#@/components";
import { AwardsService, VotableAwardsCategoryDto } from "@repo/wrapper/server";
import { useDebouncedValue } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { BaseModalChildrenProps, createErrorNotification } from "#@/util";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import dayjs from "dayjs";

export interface AwardsVoteSubmitFormProps extends BaseModalChildrenProps {
  category: VotableAwardsCategoryDto;
}

const AwardsVoteSubmitForm = ({
  category,
  onClose,
}: AwardsVoteSubmitFormProps) => {
  const queryClient = useQueryClient();
  const userId = useUserId();

  const { data: event } = useAwardEvent({ eventId: category.eventId });

  const suggestions = category?.suggestions ?? [];

  const suggestedGamesQuery = useGames({
    gameIds: suggestions.map((suggestion) => suggestion.gameId),
    relations: {
      cover: true,
    },
  });

  const [params, setParams] = useState({
    query: "",
    includeExtraContent: false,
  });

  const [delayedQuery] = useDebouncedValue(params.query, 300);

  const isQueryEnabled = delayedQuery.length > 2;

  const searchGamesQuery = useSearchGames(
    {
      query: delayedQuery,
      limit: 20,
      category: buildGameCategoryFilters({
        includeDlcs: params.includeExtraContent,
        includeExtraContent: params.includeExtraContent,
      }),
    },
    isQueryEnabled,
  );

  const searchedGames = searchGamesQuery.data?.data?.items ?? [];

  const filteredGames = useMemo(() => {
    if (searchedGames.length === 0 || event == undefined) {
      return [];
    }

    return searchedGames.filter((game) => {
      const eventYear = event.year;
      if (!game.firstReleaseDate) return true;

      return dayjs(game.firstReleaseDate).year() === eventYear;
    });
  }, [event, searchedGames]);

  const totalExcludedItems =
    (searchedGames.length ?? 0) - (filteredGames?.length ?? 0);

  const showSuggestions = suggestions.length > 0 && !category.isPersonalGOTY;

  const voteMutation = useMutation({
    mutationFn: async (gameId: number) => {
      await AwardsService.awardsVoteControllerRegisterVoteV1({
        categoryId: category.id,
        gameId,
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["awards", "vote", userId, category.id],
      });
    },
    onError: createErrorNotification,
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: `Your vote for ${category.name} has been submitted!`,
      });
      onClose?.();
    },
  });

  const onGameSelect = (gameId: number) => {
    voteMutation.mutate(gameId);
  };

  return (
    <SessionAuth>
      <Stack className={"w-full relative"}>
        {voteMutation.isPending && <Progress value={100} animated />}
        <Text className={"text-sm text-dimmed"}>
          You are voting in the &#34;{category.name}&#34; category.
        </Text>
        <GameSelectView>
          <GameSelectView.SearchBar
            onSearch={(query) =>
              setParams((prev) => ({ ...prev, query: query.trim() }))
            }
            onClear={() => setParams((prev) => ({ ...prev, query: "" }))}
          />
          <GameSearchViewActions
            includeExtraContent={params.includeExtraContent}
            onExtraContentChange={(includeExtraContent) => {
              setParams((prev) => ({
                ...prev,
                includeExtraContent,
              }));
            }}
          />
          {searchGamesQuery.isLoading && <CenteredLoading />}
          {totalExcludedItems > 0 && (
            <Text className={"text-sm text-dimmed"}>
              Excluding {totalExcludedItems} games not launched in {event?.year}{" "}
              from the results.
            </Text>
          )}
          {filteredGames && (
            <GameSelectView.Content
              items={filteredGames}
              onSelected={onGameSelect}
              checkIsSelected={() => false}
              excludeItemsInLibrary={false}
            />
          )}
          {showSuggestions && (
            <DetailsBox title={"Suggestions from our editors"}>
              {suggestedGamesQuery.isLoading && <CenteredLoading />}
              {suggestedGamesQuery.data && (
                <GameSelectView.Content
                  items={suggestedGamesQuery.data}
                  onSelected={onGameSelect}
                  checkIsSelected={() => false}
                  excludeItemsInLibrary={false}
                />
              )}
            </DetailsBox>
          )}
        </GameSelectView>
      </Stack>
    </SessionAuth>
  );
};

export { AwardsVoteSubmitForm };
