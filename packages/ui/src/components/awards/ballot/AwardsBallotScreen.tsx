import { useAwardEvent } from "#@/components/awards/hooks/useAwardEvent";
import { useAwardEventCategories } from "#@/components/awards/hooks/useAwardEventCategories";
import { useAwardsBallot } from "#@/components/awards/hooks/useAwardsBallot";
import { useAwardsVoteMutation } from "#@/components/awards/hooks/useAwardsVoteMutation";
import { AwardsEligibleGameSearch } from "#@/components/awards/search/AwardsEligibleGameSearch";
import { AwardsCategoryLayout } from "#@/components/awards/shared/AwardsCategoryLayout";
import type { AwardsCategoryListRow } from "#@/components/awards/shared/AwardsCategoryList";
import { AwardsCategoryPanel } from "#@/components/awards/shared/AwardsCategoryPanel";
import {
  AwardsNomineeCard,
  type AwardsNomineeCardProps,
} from "#@/components/awards/shared/AwardsNomineeCard";
import { useAwardsCategoryText } from "#@/components/awards/shared/awardsCategoryText";
import type {
  AwardsBallotCategory,
  AwardsBallotNominee,
} from "#@/components/awards/types";
import { useRedirectToAuth } from "#@/components/auth/hooks/useRedirectToAuth";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  formatUtcDate,
  useFormatLocale,
} from "#@/components/events/util/format";
import { SeasonEventHeader } from "#@/components/events/view/SeasonEventHeader";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { useGames } from "#@/components/game/hooks/useGames";
import type { Game } from "@repo/wrapper/server";
import { ApiError } from "@repo/wrapper/server";
import { useShareText } from "#@/context";
import { cn, createErrorNotification, Link } from "#@/util";
import { Box, Button, Group, Paper, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { IconShare } from "@tabler/icons-react";
import { useState, type ReactNode } from "react";

/** Relations hydrating every nominee: cover, developer and platforms. */
const BALLOT_GAME_RELATIONS = {
  cover: true,
  platforms: true,
  involvedCompanies: {
    company: true,
  },
};

/** "Koei Tecmo · PS5, PC": developer and up to three platform abbreviations. */
function gameMetadata(game: Game | undefined | null): string | null {
  if (!game) {
    return null;
  }

  const developer = game.involvedCompanies?.find(
    (involvedCompany) => involvedCompany.developer,
  )?.company?.name;

  const platforms = (game.platforms ?? [])
    .slice(0, 3)
    .map((platform) => platform.abbreviation || platform.name)
    .filter((platform): platform is string => !!platform)
    .join(", ");

  const parts = [developer, platforms].filter((part): part is string => !!part);

  return parts.length > 0 ? parts.join(" · ") : null;
}

/** The voted game first; the rest keep the server order (not a ranking). */
function orderNominees(
  nominees: AwardsBallotNominee[],
  voteGameId: number | null,
): AwardsBallotNominee[] {
  if (voteGameId == null) {
    return nominees;
  }

  return [...nominees].sort((a, b) => {
    if (a.gameId === voteGameId) return -1;
    if (b.gameId === voteGameId) return 1;
    return 0;
  });
}

export interface AwardsBallotScreenProps {
  eventYear: number;
  className?: string;
}

/**
 * `/awards/:year/vote` (spec: awards-ballot).
 *
 * Reads the authenticated ballot plus the event categories, joins both by
 * category id (the global GOTY flag only lives in the categories read), and
 * renders the categories in payload order with "Categoria NN de MM".
 *
 * In `voting`, choosing a nominee (or an eligible game in the personal GOTY
 * and in legacy categories without nominees) fills the vote bar; confirming
 * sends the vote optimistically, advances to the next category and rolls back
 * on error. Skipping advances without voting. Outside `voting` the ballot is
 * read-only, and a visitor only sees the sign-in invite: the ballot read stays
 * disabled and a 401 is never treated as an empty ballot.
 */
const AwardsBallotScreen = ({
  eventYear,
  className,
}: AwardsBallotScreenProps) => {
  const { t } = useTranslation();
  const resolveCategoryText = useAwardsCategoryText();
  const locale = useFormatLocale();
  const userId = useUserId();
  const redirectToAuth = useRedirectToAuth();
  const shareText = useShareText();

  const eventQuery = useAwardEvent({ eventYear });
  const event = eventQuery.data;
  const phase = event?.phase;

  const categoriesQuery = useAwardEventCategories(event?.id);
  const ballotQuery = useAwardsBallot(event?.id);
  const voteMutation = useAwardsVoteMutation(event?.id);

  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);
  const [pending, setPending] = useState<{
    categoryId: number;
    gameId: number;
  } | null>(null);

  const categoriesById = new Map(
    (categoriesQuery.data ?? []).map((category) => [category.id, category]),
  );

  const ballot = ballotQuery.data;

  const displayCategories: (AwardsBallotCategory & { isGOTY: boolean })[] = (
    ballot?.categories ?? []
  ).map((category) => {
    const joined = categoriesById.get(category.id);
    const text = resolveCategoryText({
      name: category.name,
      description: category.description || joined?.description || "",
      // The ballot category carries the translations; the joined read is the
      // fallback for older payloads or an empty array.
      translations:
        category.translations && category.translations.length > 0
          ? category.translations
          : joined?.translations,
    });

    return {
      ...category,
      name: text.name,
      description: text.description,
      isPersonalGOTY:
        category.isPersonalGOTY || joined?.isPersonalGOTY === true,
      isGOTY: joined?.isGOTY === true,
      nominees: orderNominees(category.nominees, category.voteGameId),
    };
  });

  const activeCategory =
    displayCategories.find((category) => category.id === selectedCategoryId) ??
    displayCategories[0];
  const activeIndex = activeCategory
    ? displayCategories.findIndex(
        (category) => category.id === activeCategory.id,
      )
    : -1;
  const nextCategory =
    activeIndex >= 0 ? displayCategories[activeIndex + 1] : undefined;

  const screenGameIds = new Set<number>();
  for (const category of displayCategories) {
    for (const nominee of category.nominees) {
      screenGameIds.add(nominee.gameId);
    }
    if (category.voteGameId != null) {
      screenGameIds.add(category.voteGameId);
    }
    if (category.suggestedGameId != null) {
      screenGameIds.add(category.suggestedGameId);
    }
  }
  if (pending) {
    screenGameIds.add(pending.gameId);
  }

  const gamesQuery = useGames({
    gameIds: Array.from(screenGameIds).sort((a, b) => a - b),
    relations: BALLOT_GAME_RELATIONS,
  });

  const gamesById = new Map<number, Game>(
    (gamesQuery.data ?? []).map((game) => [game.id, game]),
  );

  const isVotingPhase = phase === "voting";
  const canVote = isVotingPhase && !!userId && !!ballot;

  const pendingForActive =
    activeCategory && pending?.categoryId === activeCategory.id
      ? pending.gameId
      : null;

  const selectCategory = (categoryId: number) => {
    setPending(null);
    setSelectedCategoryId(categoryId);
  };

  const selectGame = (gameId: number) => {
    if (!activeCategory || !canVote) {
      return;
    }
    if (gameId === activeCategory.voteGameId) {
      setPending(null);
      return;
    }
    setPending({ categoryId: activeCategory.id, gameId });
  };

  const advance = (fromCategoryId: number) => {
    const index = displayCategories.findIndex(
      (category) => category.id === fromCategoryId,
    );
    const next = displayCategories[index + 1];
    setPending(null);
    if (next) {
      setSelectedCategoryId(next.id);
    }
  };

  const skip = () => {
    if (!activeCategory || !canVote) {
      return;
    }
    advance(activeCategory.id);
  };

  const confirm = () => {
    if (!pending || !activeCategory || !canVote || voteMutation.isPending) {
      return;
    }

    const categoryId = pending.categoryId;
    voteMutation
      .mutateAsync({ categoryId, gameId: pending.gameId })
      .then(() => advance(categoryId))
      .catch(() => setPending(null));
  };

  const shareBallot = async () => {
    if (!event || !userId) {
      return;
    }

    const url = `https://gamenode.app/awards/${event.year}/nominees/${userId}`;
    const text = t("awards.ballot.shareText", { year: event.year, url });

    try {
      await shareText(text);
      return;
    } catch {
      // Sharing isn't available here; fall back to the clipboard.
    }

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard is not available");
      }
      await navigator.clipboard.writeText(text);
      notifications.show({ message: t("awards.ballot.linkCopied") });
    } catch (error) {
      createErrorNotification(error as Error);
    }
  };

  if (!Number.isFinite(eventYear)) {
    return null;
  }

  if (eventQuery.isPending) {
    return <CenteredLoading />;
  }

  if (!event) {
    return null;
  }

  const signInPanel = (
    <Paper
      data-awards-ballot-sign-in
      className={"w-full border border-paper-4 bg-paper-2 p-4"}
    >
      <Stack gap={"sm"}>
        <Text fw={600}>{t("awards.ballot.signIn.title")}</Text>
        <Text size={"sm"} c={"dimmed"}>
          {t("awards.ballot.signIn.description")}
        </Text>
        <Button
          data-awards-ballot-sign-in-action
          variant={"light"}
          className={"self-start"}
          onClick={() => void redirectToAuth()}
        >
          {t("awards.ballot.signIn.action")}
        </Button>
      </Stack>
    </Paper>
  );

  if (!userId) {
    return (
      <Stack data-awards-ballot-screen className={cn(className)} gap={"lg"}>
        <SeasonEventHeader year={event.year} screen={"voting"} />
        {signInPanel}
      </Stack>
    );
  }

  if (ballotQuery.isError) {
    const isUnauthorized =
      ballotQuery.error instanceof ApiError && ballotQuery.error.status === 401;

    return (
      <Stack data-awards-ballot-screen className={cn(className)} gap={"lg"}>
        <SeasonEventHeader year={event.year} screen={"voting"} />
        {isUnauthorized ? (
          signInPanel
        ) : (
          <Text data-awards-ballot-load-error size={"sm"} c={"dimmed"}>
            {t("awards.ballot.loadError")}
          </Text>
        )}
      </Stack>
    );
  }

  if (ballotQuery.isPending || categoriesQuery.isPending || !ballot) {
    return <CenteredLoading />;
  }

  const progressTotal = ballot.categoriesTotal;
  const isComplete =
    progressTotal > 0 && ballot.categoriesVoted >= progressTotal;

  const categoryRows: AwardsCategoryListRow[] = displayCategories.map(
    (category) => {
      const suggestionGame =
        category.isPersonalGOTY &&
        category.voteGameId == null &&
        category.suggestedGameId != null
          ? gamesById.get(category.suggestedGameId)
          : undefined;

      return {
        id: category.id,
        name: category.name,
        state:
          category.id === activeCategory?.id
            ? "active"
            : category.voteGameId != null
              ? "voted"
              : "pending",
        game:
          category.voteGameId != null
            ? gamesById.get(category.voteGameId)
            : undefined,
        suggestionGameName: suggestionGame?.name,
      };
    },
  );

  const nomineeCard = (
    nominee: AwardsBallotNominee,
    selected: boolean,
  ): AwardsNomineeCardProps => {
    const game = gamesById.get(nominee.gameId);

    return {
      gameId: nominee.gameId,
      game,
      status: nominee.status,
      playtimeSeconds: nominee.playtimeSeconds,
      rating: nominee.rating,
      metadata: gameMetadata(game),
      selected,
      selectedLabel:
        selected && pendingForActive === nominee.gameId
          ? t("awards.ballot.selected")
          : undefined,
      onSelect: canVote ? selectGame : undefined,
      disabled: voteMutation.isPending,
    };
  };

  let panelContent: ReactNode = null;
  let panelNominees: AwardsNomineeCardProps[] = [];

  if (activeCategory) {
    const hasNomineeGrid =
      activeCategory.nominees.length > 0 && !activeCategory.isPersonalGOTY;
    const selectedGameId =
      pendingForActive ?? activeCategory.voteGameId ?? null;

    if (hasNomineeGrid) {
      panelNominees = activeCategory.nominees.map((nominee) =>
        nomineeCard(nominee, nominee.gameId === selectedGameId),
      );
    }

    const votedGame =
      activeCategory.voteGameId != null
        ? gamesById.get(activeCategory.voteGameId)
        : undefined;

    const votedCard =
      activeCategory.voteGameId != null ? (
        <AwardsNomineeCard
          gameId={activeCategory.voteGameId}
          game={votedGame}
          selected
          selectedLabel={t("awards.shared.nominee.yourVote")}
          onSelect={canVote ? selectGame : undefined}
          disabled={voteMutation.isPending}
        />
      ) : null;

    const suggestedGame =
      activeCategory.suggestedGameId != null
        ? gamesById.get(activeCategory.suggestedGameId)
        : undefined;

    const suggestion =
      activeCategory.isPersonalGOTY &&
      activeCategory.voteGameId == null &&
      activeCategory.suggestedGameId != null ? (
        <Stack gap={"xs"} data-awards-ballot-suggestion>
          <Text size={"sm"} c={"dimmed"}>
            {t("awards.ballot.suggestion", {
              game: suggestedGame?.name ?? "",
            })}
          </Text>
          <AwardsNomineeCard
            gameId={activeCategory.suggestedGameId}
            game={suggestedGame}
            selected={pendingForActive === activeCategory.suggestedGameId}
            selectedLabel={t("awards.ballot.selected")}
            onSelect={canVote ? selectGame : undefined}
            disabled={voteMutation.isPending}
          />
        </Stack>
      ) : null;

    const showSearch =
      canVote && (activeCategory.isPersonalGOTY || !hasNomineeGrid);

    // The existing vote always wins over the personal GOTY suggestion, and the
    // search below it lets the user change the pick. Legacy categories without
    // nominees only have a card once the user voted.
    const pickerCard =
      activeCategory.voteGameId != null
        ? votedCard
        : activeCategory.isPersonalGOTY
          ? suggestion
          : null;

    if (activeCategory.isPersonalGOTY || !hasNomineeGrid) {
      panelContent = (
        <Stack gap={"md"} data-awards-ballot-picker>
          {pickerCard}
          {showSearch && (
            <Stack gap={"sm"} data-awards-ballot-search>
              <Text fw={600}>{t("awards.ballot.searchTitle")}</Text>
              <AwardsEligibleGameSearch
                key={activeCategory.id}
                year={event.year}
                eligibilityCutoffDate={event.eligibilityCutoffDate}
                onSelect={selectGame}
                selectedGameIds={
                  activeCategory.voteGameId != null
                    ? [activeCategory.voteGameId]
                    : []
                }
                disabled={voteMutation.isPending}
              />
            </Stack>
          )}
          {!canVote && activeCategory.voteGameId == null && (
            <Text size={"sm"} c={"dimmed"}>
              {t("awards.ballot.noVote")}
            </Text>
          )}
        </Stack>
      );
    }
  }

  let voteBar: ReactNode = null;

  if (canVote && activeCategory) {
    if (pending && pending.categoryId === activeCategory.id) {
      const pendingGame = gamesById.get(pending.gameId);

      voteBar = (
        <Stack data-awards-vote-bar-content gap={"sm"}>
          <Stack gap={2}>
            <Text size={"sm"} c={"dimmed"}>
              {t("awards.ballot.voteBar.title", {
                category: activeCategory.name,
              })}
            </Text>
            <Text fw={600}>{pendingGame?.name}</Text>
          </Stack>
          <Group gap={"sm"} wrap={"wrap"}>
            <Button
              data-awards-vote-skip
              variant={"default"}
              onClick={skip}
              disabled={voteMutation.isPending}
            >
              {t("awards.ballot.voteBar.skip")}
            </Button>
            <Button
              data-awards-vote-confirm
              onClick={confirm}
              loading={voteMutation.isPending}
            >
              {nextCategory
                ? t("awards.ballot.voteBar.confirmNext", {
                    category: nextCategory.name,
                  })
                : t("awards.ballot.voteBar.confirmLast")}
            </Button>
          </Group>
        </Stack>
      );
    } else if (isComplete) {
      voteBar = (
        <Stack data-awards-ballot-complete gap={"sm"}>
          <Text fw={600}>{t("awards.ballot.voteBar.complete")}</Text>
          <Text size={"sm"} c={"dimmed"}>
            {t("awards.ballot.voteBar.completeHint")}
          </Text>
          <Button
            leftSection={<IconShare size={18} />}
            onClick={shareBallot}
            data-awards-ballot-share-complete
          >
            {t("awards.ballot.share")}
          </Button>
        </Stack>
      );
    }
  }

  const readOnlyMessage =
    phase === "voting_closed" || phase === "results"
      ? t("awards.ballot.readOnly")
      : phase === "upcoming" ||
          phase === "nominations" ||
          phase === "nominations_closed"
        ? t("awards.ballot.votingOpens", {
            date:
              formatUtcDate(event.votingStartDate, locale) ??
              t("awards.ballot.votingOpensUnknown"),
          })
        : null;

  return (
    <Stack
      data-awards-ballot-screen
      data-phase={phase}
      className={cn(className)}
      gap={"lg"}
    >
      <SeasonEventHeader year={event.year} screen={"voting"} />
      {!isVotingPhase && readOnlyMessage && (
        <Stack data-awards-ballot-read-only gap={"sm"}>
          <Text size={"sm"} c={"dimmed"}>
            {readOnlyMessage}
          </Text>
          {phase === "results" && (
            <Link
              href={`/awards/${event.year}/result`}
              className={"self-start"}
            >
              <Button
                data-awards-ballot-results-link
                variant={"light"}
                size={"sm"}
              >
                {t("awards.ballot.viewResults")}
              </Button>
            </Link>
          )}
        </Stack>
      )}
      {activeCategory ? (
        <AwardsCategoryLayout
          categories={categoryRows}
          onSelectCategory={selectCategory}
          title={t("awards.ballot.title")}
          current={ballot.categoriesVoted}
          total={progressTotal}
          voteBar={voteBar}
        >
          <Box
            data-awards-goty-category={activeCategory.isGOTY ? "true" : "false"}
          >
            <AwardsCategoryPanel
              key={activeCategory.id}
              index={activeIndex}
              total={displayCategories.length}
              name={activeCategory.name}
              description={activeCategory.description}
              nominees={panelNominees}
              playedNomineesCount={activeCategory.playedNomineesCount}
            >
              {panelContent}
            </AwardsCategoryPanel>
          </Box>
        </AwardsCategoryLayout>
      ) : (
        <Text data-awards-ballot-empty size={"sm"} c={"dimmed"}>
          {t("awards.ballot.noCategories")}
        </Text>
      )}
      {userId && !isComplete && (
        <Group justify={"flex-start"}>
          <Button
            data-awards-ballot-share
            variant={"light"}
            leftSection={<IconShare size={18} />}
            onClick={shareBallot}
          >
            {t("awards.ballot.share")}
          </Button>
        </Group>
      )}
    </Stack>
  );
};

export { AwardsBallotScreen };
