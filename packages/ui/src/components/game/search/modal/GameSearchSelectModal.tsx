import React, { useState } from "react";
import { BaseModalProps, getErrorMessage, Modal } from "#@/util";
import { Stack } from "@mantine/core";
import {
  CenteredErrorMessage,
  CenteredLoading,
  GameSelectView,
  SearchBar,
  buildGameSearchRequestDto,
  useOnMobile,
  useSearchGames,
  useUserId,
} from "#@/components";
import { useDebouncedValue } from "@mantine/hooks";
import { GameSearchSuggestions } from "#@/components/game/search/modal/GameSearchSuggestions.tsx";

interface Props extends BaseModalProps {
  onSelected: (gameId: number) => void;
}

const GameSearchSelectModal = ({ onClose, opened, onSelected }: Props) => {
  const userId = useUserId();
  const onMobile = useOnMobile();
  const [value, setValue] = useState("");
  const [debouncedQuery] = useDebouncedValue(value, 400);
  const isQueryEnabled =
    debouncedQuery != undefined && debouncedQuery.length > 2;

  const { data, isError, error, isLoading } = useSearchGames(
    {
      ...buildGameSearchRequestDto({
        query: debouncedQuery,
        includeDlcs: true,
        includeExtraContent: true,
      }),
      limit: 20,
    },
    isQueryEnabled,
  );

  const games = data?.data?.items;

  const showRecentGames =
    userId != undefined && !isQueryEnabled && games == undefined;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Find and select a game"}
      fullScreen={onMobile}
      size={"lg"}
      breakpoints={[0.5, 0.75, 1]}
      initialBreakpoint={1}
    >
      <Stack className={"w-full"}>
        <SearchBar
          label={"Search for a game"}
          value={value}
          onChange={(evt) => setValue(evt.currentTarget.value)}
          className={"my-4"}
        />
        {isLoading && <CenteredLoading />}
        {isError && <CenteredErrorMessage message={getErrorMessage(error)} />}
        {games != undefined && (
          <GameSelectView>
            <GameSelectView.Content
              items={games}
              checkIsSelected={() => false}
              excludeItemsInLibrary={false}
              onSelected={onSelected}
              cols={{
                base: 3,
              }}
            />
          </GameSelectView>
        )}
        {showRecentGames && (
          <GameSearchSuggestions userId={userId} onSelected={onSelected} />
        )}
      </Stack>
    </Modal>
  );
};

export { GameSearchSelectModal };
