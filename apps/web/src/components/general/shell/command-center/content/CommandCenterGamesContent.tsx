import { CommandCenterGameAction } from "@/components/general/shell/command-center/action/CommandCenterGameAction";
import { Skeleton, Stack } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Spotlight } from "@mantine/spotlight";
import { useTranslation } from "@repo/locales";
import {
  BaseModalChildrenProps,
  buildGameSearchRequestDto,
  SearchGame,
  useSearchGames,
} from "@repo/ui";
import { useCallback } from "react";

interface Props extends BaseModalChildrenProps {
  query: string;
  isQueryEnabled: boolean;
}

const CommandCenterGamesContent = ({
  query,
  isQueryEnabled,
  onClose,
}: Props) => {
  const { t } = useTranslation();
  const [debouncedQuery] = useDebouncedValue(query, 400);

  const searchGamesQuery = useSearchGames(
    {
      ...buildGameSearchRequestDto({
        query: debouncedQuery,
        includeExtraContent: true,
        includeDlcs: true,
      }),
      limit: 10,
    },
    isQueryEnabled,
    false,
  );

  const games: SearchGame[] = searchGamesQuery.data?.data?.items || [];

  const renderLoadingSkeletons = useCallback(() => {
    return new Array(3)
      .fill(0)
      .map((_, i) => <Skeleton key={i} height={60} width={"100%"} />);
  }, []);

  if (!isQueryEnabled) {
    return null;
  }

  return (
    <Spotlight.ActionsGroup label={"Games"}>
      <Stack className={"px-4 gap-2 mt-2"}>
        {games.map((game) => (
          <CommandCenterGameAction game={game} key={game.id} />
        ))}
        {searchGamesQuery.isLoading && renderLoadingSkeletons()}

        {isQueryEnabled &&
          !searchGamesQuery.isLoading &&
          games.length === 0 && (
            <Spotlight.Empty>{t("game.search.noGamesFound")}</Spotlight.Empty>
          )}
      </Stack>
    </Spotlight.ActionsGroup>
  );
};

export { CommandCenterGamesContent };
