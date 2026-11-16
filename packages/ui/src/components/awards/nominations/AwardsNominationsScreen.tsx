import { useAwardEvent } from "#@/components/awards/hooks/useAwardEvent";
import { useAwardEventCategories } from "#@/components/awards/hooks/useAwardEventCategories";
import { useAwardsNominations } from "#@/components/awards/hooks/useAwardsNominations";
import { useAwardsNominationsMutation } from "#@/components/awards/hooks/useAwardsNominationsMutation";
import { AwardsEligibleGameSearch } from "#@/components/awards/search/AwardsEligibleGameSearch";
import { AwardsCategoryLayout } from "#@/components/awards/shared/AwardsCategoryLayout";
import type { AwardsCategoryListRow } from "#@/components/awards/shared/AwardsCategoryList";
import { AwardsCategoryPanel } from "#@/components/awards/shared/AwardsCategoryPanel";
import {
  AwardsNomineeCard,
  type AwardsNomineeCardProps,
} from "#@/components/awards/shared/AwardsNomineeCard";
import { useAwardsCategoryText } from "#@/components/awards/shared/awardsCategoryText";
import type { AwardsMyNominations } from "#@/components/awards/types";
import { sortByCategoryOrder } from "#@/components/awards/util/goty";
import { useRedirectToAuth } from "#@/components/auth/hooks/useRedirectToAuth";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  formatUtcDate,
  useFormatLocale,
} from "#@/components/events/util/format";
import { SeasonEventHeader } from "#@/components/events/view/SeasonEventHeader";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { useGames } from "#@/components/game/hooks/useGames";
import { Button, SimpleGrid, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { Game, VotableAwardsCategoryDto } from "@repo/wrapper/server";
import { useState, type ReactNode } from "react";

/** Maximum number of games a user may nominate in one category. */
export const AWARDS_NOMINATIONS_LIMIT = 3;

export interface AwardsNominationsScreenProps {
  eventYear: number;
  className?: string;
}

function findRow(
  nominations: AwardsMyNominations[] | undefined,
  categoryId: number,
): AwardsMyNominations | undefined {
  return nominations?.find((row) => row.categoryId === categoryId);
}

function suggestionGameIds(category: VotableAwardsCategoryDto): number[] {
  return (category.suggestions ?? []).map((suggestion) => suggestion.gameId);
}

/**
 * `/awards/:year/nominations` (spec: awards-nominations).
 *
 * Lists the event categories in server order, without the personal GOTY. In
 * the `nominations` phase the active category shows the user's current picks
 * and an eligible-game search, with up to three distinct games per category.
 * Every change replaces the category through the nominations hook, which
 * updates `nominations/me` optimistically and rolls back on error.
 *
 * Outside the phase the screen is read-only: `upcoming` shows the nomination
 * opening date, and from `nominations_closed` on each category shows the final
 * nominees and the user's own picks. Visitors see the public categories and a
 * sign-in action; their `nominations/me` read stays disabled.
 */
const AwardsNominationsScreen = ({
  eventYear,
  className,
}: AwardsNominationsScreenProps) => {
  const { t } = useTranslation();
  const resolveCategoryText = useAwardsCategoryText();
  const locale = useFormatLocale();
  const userId = useUserId();
  const redirectToAuth = useRedirectToAuth();

  const eventQuery = useAwardEvent({ eventYear });
  const event = eventQuery.data;
  const phase = event?.phase;
  const isUpcoming = phase === "upcoming";
  const isNominationsPhase = phase === "nominations";
  const showFinalNominees =
    phase === "nominations_closed" ||
    phase === "voting" ||
    phase === "voting_closed" ||
    phase === "results";

  const categoriesQuery = useAwardEventCategories(event?.id);
  const categories = sortByCategoryOrder(categoriesQuery.data).filter(
    (category) => !category.isPersonalGOTY,
  );

  // No session read while the event has not opened, and never for visitors.
  const nominationsQuery = useAwardsNominations(
    userId && !isUpcoming ? event?.id : undefined,
  );
  const nominationsMutation = useAwardsNominationsMutation(event?.id);

  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);

  const activeCategory =
    categories.find((category) => category.id === selectedCategoryId) ??
    categories[0];
  const activeIndex = activeCategory
    ? categories.findIndex((category) => category.id === activeCategory.id)
    : -1;

  const nominations = nominationsQuery.data;

  const picksByCategory = new Map<number, number[]>(
    categories.map((category) => [
      category.id,
      findRow(nominations, category.id)?.gameIds ?? [],
    ]),
  );

  // One batch read hydrates every game shown on the screen: the user's picks
  // and, in the read-only phases, the final nominees.
  const screenGameIds = new Set<number>();
  for (const category of categories) {
    for (const gameId of picksByCategory.get(category.id) ?? []) {
      screenGameIds.add(gameId);
    }
    if (showFinalNominees) {
      for (const gameId of suggestionGameIds(category)) {
        screenGameIds.add(gameId);
      }
    }
  }

  const gamesQuery = useGames({
    gameIds: Array.from(screenGameIds),
    relations: { cover: true },
  });

  const gamesById = new Map<number, Game>(
    (gamesQuery.data ?? []).map((game) => [game.id, game]),
  );

  if (!Number.isFinite(eventYear)) {
    return null;
  }

  if (eventQuery.isPending) {
    return <CenteredLoading />;
  }

  if (!event) {
    return null;
  }

  if (categoriesQuery.isPending) {
    return <CenteredLoading />;
  }

  const nominationsLoaded = !userId || nominationsQuery.isSuccess;
  const nominationsPending =
    !!userId && !isUpcoming && nominationsQuery.isPending;

  const progress = categories.filter(
    (category) => (picksByCategory.get(category.id)?.length ?? 0) > 0,
  ).length;

  const categoryRows: AwardsCategoryListRow[] = categories.map((category) => {
    const pickedIds = picksByCategory.get(category.id) ?? [];
    const firstGame =
      pickedIds.length > 0 ? gamesById.get(pickedIds[0]) : undefined;
    const text = resolveCategoryText(category);

    return {
      id: category.id,
      name: text.name,
      state:
        category.id === activeCategory?.id
          ? "active"
          : pickedIds.length > 0
            ? "voted"
            : "pending",
      game: firstGame,
      statusLabel: t("awards.nominations.pickCount", {
        count: pickedIds.length,
        limit: AWARDS_NOMINATIONS_LIMIT,
      }),
    };
  });

  const replaceCategory = (categoryId: number, gameIds: number[]) => {
    nominationsMutation.mutate({ categoryId, gameIds });
  };

  const activePickedIds = activeCategory
    ? (picksByCategory.get(activeCategory.id) ?? [])
    : [];
  const limitReached = activePickedIds.length >= AWARDS_NOMINATIONS_LIMIT;

  const addGame = (gameId: number) => {
    if (!activeCategory || limitReached || activePickedIds.includes(gameId)) {
      return;
    }
    replaceCategory(activeCategory.id, [...activePickedIds, gameId]);
  };

  const removeGame = (gameId: number) => {
    if (!activeCategory) {
      return;
    }
    replaceCategory(
      activeCategory.id,
      activePickedIds.filter((pickedId) => pickedId !== gameId),
    );
  };

  const pickCardProps = (
    gameId: number,
    removable: boolean,
  ): AwardsNomineeCardProps => ({
    gameId,
    game: gamesById.get(gameId),
    selected: true,
    selectedLabel: t("awards.nominations.yourPick"),
    onRemove: removable ? removeGame : undefined,
  });

  const finalNomineeCardProps = (gameId: number): AwardsNomineeCardProps => ({
    gameId,
    game: gamesById.get(gameId),
  });

  const startDate = isUpcoming
    ? formatUtcDate(event.nominationStartDate, locale)
    : null;

  let panelContent: ReactNode = null;

  if (isUpcoming) {
    panelContent = (
      <Stack gap={"sm"} data-awards-nominations-upcoming>
        <Text size={"sm"} c={"dimmed"}>
          {startDate
            ? t("awards.nominations.upcoming", { date: startDate })
            : t("awards.nominations.upcomingUnknown")}
        </Text>
      </Stack>
    );
  } else if (isNominationsPhase) {
    panelContent = (
      <Stack gap={"sm"} data-awards-nominations-actions>
        {userId ? (
          nominationsQuery.isError ? (
            <Text size={"sm"} c={"dimmed"}>
              {t("awards.nominations.loadError")}
            </Text>
          ) : nominationsLoaded && activeCategory ? (
            <>
              {limitReached && (
                <Text data-awards-nominations-limit size={"sm"} c={"dimmed"}>
                  {t("awards.nominations.limitReached", {
                    count: AWARDS_NOMINATIONS_LIMIT,
                  })}
                </Text>
              )}
              <Text fw={600}>{t("awards.nominations.searchTitle")}</Text>
              <AwardsEligibleGameSearch
                key={activeCategory.id}
                year={event.year}
                eligibilityCutoffDate={event.eligibilityCutoffDate}
                onSelect={addGame}
                selectedGameIds={activePickedIds}
                disabled={limitReached}
              />
            </>
          ) : (
            <CenteredLoading />
          )
        ) : (
          <Button
            data-awards-nominations-sign-in
            variant={"light"}
            className={"self-start"}
            onClick={() => void redirectToAuth()}
          >
            {t("awards.nominations.signInToNominate")}
          </Button>
        )}
      </Stack>
    );
  } else if (showFinalNominees && activeCategory) {
    const finalNomineeIds = suggestionGameIds(activeCategory);
    panelContent = (
      <Stack gap={"md"} data-awards-nominations-read-only>
        <Text size={"sm"} c={"dimmed"}>
          {t("awards.nominations.closed")}
        </Text>
        <Stack gap={"sm"}>
          <Text fw={600}>{t("awards.nominations.finalNominees")}</Text>
          {finalNomineeIds.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={"sm"}>
              {finalNomineeIds.map((gameId) => (
                <AwardsNomineeCard
                  key={gameId}
                  {...finalNomineeCardProps(gameId)}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Text size={"sm"} c={"dimmed"}>
              {t("awards.nominations.noFinalNominees")}
            </Text>
          )}
        </Stack>
        {userId && (
          <Stack gap={"sm"}>
            <Text fw={600}>{t("awards.nominations.yourNominations")}</Text>
            {activePickedIds.length > 0 ? (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={"sm"}>
                {activePickedIds.map((gameId) => (
                  <AwardsNomineeCard
                    key={gameId}
                    {...pickCardProps(gameId, false)}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Text size={"sm"} c={"dimmed"}>
                {t("awards.nominations.noPicks")}
              </Text>
            )}
          </Stack>
        )}
        {!userId && (
          <Button
            data-awards-nominations-sign-in
            variant={"light"}
            className={"self-start"}
            onClick={() => void redirectToAuth()}
          >
            {t("awards.nominations.signInToSee")}
          </Button>
        )}
      </Stack>
    );
  }

  const activeNomineeCardProps: AwardsNomineeCardProps[] =
    isNominationsPhase && userId && activeCategory
      ? activePickedIds.map((gameId) => pickCardProps(gameId, true))
      : [];

  const activeCategoryText = activeCategory
    ? resolveCategoryText(activeCategory)
    : undefined;

  return (
    <Stack data-awards-nominations-screen className={className} gap={"lg"}>
      <SeasonEventHeader year={event.year} screen={"nominations"} />
      <Stack gap={4}>
        <Text size={"xl"} fw={700}>
          {t("awards.nominations.title")}
        </Text>
        {isNominationsPhase ? (
          <Text size={"sm"} c={"dimmed"}>
            {t("awards.nominations.subtitle", {
              count: AWARDS_NOMINATIONS_LIMIT,
            })}
          </Text>
        ) : (
          showFinalNominees && (
            <Text size={"sm"} c={"dimmed"}>
              {t("awards.nominations.subtitleClosed")}
            </Text>
          )
        )}
      </Stack>
      {activeCategory ? (
        <AwardsCategoryLayout
          categories={categoryRows}
          onSelectCategory={setSelectedCategoryId}
          title={t("awards.nominations.categories")}
          current={progress}
          total={categories.length}
        >
          <AwardsCategoryPanel
            index={activeIndex}
            total={categories.length}
            name={activeCategoryText?.name ?? activeCategory.name}
            description={
              activeCategoryText?.description ?? activeCategory.description
            }
            nominees={activeNomineeCardProps}
            showPlayedFilter={false}
          >
            {nominationsPending ? <CenteredLoading /> : panelContent}
          </AwardsCategoryPanel>
        </AwardsCategoryLayout>
      ) : (
        <Text size={"sm"} c={"dimmed"}>
          {t("awards.nominations.noCategories")}
        </Text>
      )}
    </Stack>
  );
};

export { AwardsNominationsScreen };
