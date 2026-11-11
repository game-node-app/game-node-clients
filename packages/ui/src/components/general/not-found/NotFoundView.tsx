import { Box, Button, Flex, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { Game } from "@repo/wrapper/server";
import { IconSearch } from "@tabler/icons-react";
import { DEFAULT_SEARCH_TRENDING_GAMES_DTO } from "#@/components/game/trending/TrendingGamesList";
import { useGames } from "#@/components/game/hooks/useGames";
import { NotFoundPixelArt } from "#@/components/general/not-found/NotFoundPixelArt";
import { NotFoundTrendingGames } from "#@/components/general/not-found/NotFoundTrendingGames";
import { useTrendingGames } from "#@/components/statistics/hooks/useTrendingGames";
import { cn, Link } from "#@/util";

const NOT_FOUND_TRENDING_REQUEST = {
  ...DEFAULT_SEARCH_TRENDING_GAMES_DTO,
  limit: 3,
};

export interface NotFoundViewProps {
  /** Where "Back to home" goes. Defaults to the root route. */
  homeHref?: string;
  /** Where "Search games" goes. */
  searchHref: string;
  className?: string;
}

/**
 * "Level not found" 404 content. The app shell (header, sidebar, dock) is
 * provided by each app, so this only renders the page content.
 */
const NotFoundView = ({
  homeHref = "/",
  searchHref,
  className,
}: NotFoundViewProps) => {
  const { t } = useTranslation();

  const trendingQuery = useTrendingGames(NOT_FOUND_TRENDING_REQUEST);
  const trendingGameIds = trendingQuery.data?.items
    .map((item) => item.sourceId)
    .filter((id): id is number => typeof id === "number");

  const gamesQuery = useGames({
    gameIds: trendingGameIds ?? [],
    relations: {
      cover: true,
    },
  });

  // Keep the trending order from the ranking response.
  const trendingGames = (trendingGameIds ?? [])
    .map((id) => gamesQuery.data?.find((game) => game.id === id))
    .filter((game): game is Game => game !== undefined);

  const isLoadingTrending = trendingQuery.isLoading || gamesQuery.isLoading;

  return (
    <Box
      className={cn(
        "mx-auto flex w-full flex-col md:min-h-[calc(100vh-54px)] md:justify-center",
        className,
      )}
      px={{ base: 0, md: 80 }}
      py={{ base: 16, md: 48 }}
    >
      <Flex
        direction={{ base: "column-reverse", md: "row" }}
        align={{ md: "center" }}
        wrap={"wrap"}
        gap={{ base: 24, md: 40 }}
      >
        <Stack
          gap={16}
          className={
            "w-full max-w-[560px] md:min-w-[320px] md:max-w-[560px] md:grow md:basis-0"
          }
        >
          <Text fz={12} lh={"20px"} fw={700} tt={"uppercase"} c={"brand"}>
            {t("notFoundPage.eyebrow")}
          </Text>
          <Title
            order={1}
            fz={{ base: 28, md: 48 }}
            lh={{ base: "36px", md: "56px" }}
            fw={700}
            c={"white"}
          >
            {t("notFoundPage.title")}
          </Title>
          <Text
            fz={{ base: 16, md: 18 }}
            lh={{ base: "20px", md: "28px" }}
            c={"dimmed"}
            maw={{ base: "100%", md: 520 }}
          >
            {t("notFoundPage.description")}
          </Text>

          <Box mt={8}>
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={12}
              className={"w-full md:w-auto"}
            >
              <Button
                component={Link}
                href={homeHref}
                color={"brand"}
                radius={8}
                h={48}
                px={20}
                fz={16}
                fw={700}
                className={
                  "w-full text-[#0B0B0B] hover:bg-brand-9 hover:text-white md:w-auto"
                }
              >
                {t("notFoundPage.backHome")}
              </Button>
              <Button
                component={Link}
                href={searchHref}
                color={"dark"}
                radius={8}
                h={48}
                px={20}
                fz={16}
                fw={700}
                leftSection={<IconSearch size={20} />}
                className={
                  "w-full bg-paper-6 text-white hover:bg-paper-1 md:w-auto"
                }
              >
                {t("notFoundPage.searchGames")}
              </Button>
            </Flex>
          </Box>
        </Stack>

        <Box
          className={
            "flex w-full justify-center md:ml-auto md:w-auto md:justify-end"
          }
        >
          <NotFoundPixelArt
            cellSize={18}
            games={trendingGames}
            className={"flex md:hidden"}
          />
          <NotFoundPixelArt
            cellSize={44}
            games={trendingGames}
            className={"hidden md:flex"}
          />
        </Box>
      </Flex>

      <NotFoundTrendingGames
        games={trendingGames}
        isLoading={isLoadingTrending}
        className={"mt-10 md:hidden"}
      />
    </Box>
  );
};

export { NotFoundView };
