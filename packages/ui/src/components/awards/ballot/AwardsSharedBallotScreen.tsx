import { useAwardEvent } from "#@/components/awards/hooks/useAwardEvent";
import { useAwardEventCategories } from "#@/components/awards/hooks/useAwardEventCategories";
import { useAwardsSharedVotes } from "#@/components/awards/hooks/useAwardsSharedVotes";
import { AwardsGameCover } from "#@/components/awards/shared/AwardsGameCover";
import { formatCategoryNumber } from "#@/components/awards/shared/AwardsCategoryList";
import { useAwardsCategoryText } from "#@/components/awards/shared/awardsCategoryText";
import { sortByCategoryOrder } from "#@/components/awards/util/goty";
import { useRedirectToAuth } from "#@/components/auth/hooks/useRedirectToAuth";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { SeasonEventHeader } from "#@/components/events/view/SeasonEventHeader";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { UserAvatarGroup } from "#@/components/general/avatar/UserAvatarGroup";
import { useGames } from "#@/components/game/hooks/useGames";
import { cn, Link } from "#@/util";
import { Box, Button, Group, Paper, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { Game } from "@repo/wrapper/server";

export interface AwardsSharedBallotScreenProps {
  eventYear: number;
  /** Owner of the ballot shown in the public link. */
  userId: string;
  className?: string;
}

/**
 * `/awards/:year/nominees/:userId` (spec: awards-ballot, design §9).
 *
 * Public ballot link: reads `votes/:userId` plus the event categories and
 * shows, without a session, one row per voted category with its game. A
 * visitor gets a sign-up action; a signed-in visitor during `voting` gets a
 * shortcut to their own ballot.
 */
const AwardsSharedBallotScreen = ({
  eventYear,
  userId,
  className,
}: AwardsSharedBallotScreenProps) => {
  const { t } = useTranslation();
  const resolveCategoryText = useAwardsCategoryText();
  const viewerId = useUserId();
  const redirectToAuth = useRedirectToAuth();

  const eventQuery = useAwardEvent({ eventYear });
  const event = eventQuery.data;

  const categoriesQuery = useAwardEventCategories(event?.id);
  const votesQuery = useAwardsSharedVotes(event?.id, userId);

  const votes = votesQuery.data ?? [];

  const gamesQuery = useGames({
    gameIds: Array.from(new Set(votes.map((vote) => vote.gameId))).sort(
      (a, b) => a - b,
    ),
    relations: { cover: true },
  });

  const gamesById = new Map<number, Game>(
    (gamesQuery.data ?? []).map((game) => [game.id, game]),
  );

  if (!Number.isFinite(eventYear) || !userId) {
    return null;
  }

  if (eventQuery.isPending) {
    return <CenteredLoading />;
  }

  if (!event) {
    return null;
  }

  if (categoriesQuery.isPending || votesQuery.isPending) {
    return <CenteredLoading />;
  }

  const votesByCategory = new Map(
    votes.map((vote) => [vote.categoryId, vote.gameId]),
  );
  const categories = sortByCategoryOrder(categoriesQuery.data);
  const rows = categories
    .filter((category) => votesByCategory.has(category.id))
    .map((category, index) => ({
      category,
      text: resolveCategoryText(category),
      position: index + 1,
      gameId: votesByCategory.get(category.id)!,
    }));

  const signUpPanel = !viewerId ? (
    <Paper
      data-awards-shared-sign-up
      className={"w-full border border-paper-4 bg-paper-2 p-4"}
    >
      <Stack gap={"sm"}>
        <Text fw={600}>
          {t("awards.ballot.shared.signUpTitle", { year: event.year })}
        </Text>
        <Text size={"sm"} c={"dimmed"}>
          {t("awards.ballot.shared.signUpDescription")}
        </Text>
        <Button
          data-awards-shared-sign-up-action
          variant={"light"}
          className={"self-start"}
          onClick={() => void redirectToAuth()}
        >
          {t("awards.ballot.shared.signUp")}
        </Button>
      </Stack>
    </Paper>
  ) : event.phase === "voting" ? (
    <Group justify={"flex-start"}>
      <Link href={`/awards/${event.year}/vote`}>
        <Button data-awards-shared-own-ballot variant={"light"}>
          {t("awards.ballot.shared.own")}
        </Button>
      </Link>
    </Group>
  ) : null;

  return (
    <Stack data-awards-shared-ballot className={cn(className)} gap={"lg"}>
      <SeasonEventHeader year={event.year} screen={"voting"} />
      <Group justify={"space-between"} align={"flex-start"} wrap={"wrap"}>
        <Stack gap={2}>
          <Text size={"xl"} fw={700}>
            {t("awards.ballot.shared.heading")}
          </Text>
          <Text size={"sm"} c={"dimmed"}>
            {t("awards.ballot.shared.votes", {
              count: rows.length,
              total: categories.length,
            })}
          </Text>
        </Stack>
        <Box data-awards-shared-owner className={"max-w-full"}>
          <UserAvatarGroup
            userId={userId}
            groupProps={{
              gap: "sm",
            }}
          />
        </Box>
      </Group>

      {votesQuery.isError || categoriesQuery.isError ? (
        <Text data-awards-shared-load-error size={"sm"} c={"dimmed"}>
          {t("awards.ballot.shared.loadError")}
        </Text>
      ) : votes.length === 0 ? (
        <Paper
          data-awards-shared-empty
          className={"w-full border border-paper-4 bg-paper-2 p-4"}
        >
          <Stack gap={2}>
            <Text fw={600}>{t("awards.ballot.shared.emptyTitle")}</Text>
            <Text size={"sm"} c={"dimmed"}>
              {t("awards.ballot.shared.empty", { year: event.year })}
            </Text>
          </Stack>
        </Paper>
      ) : (
        <Stack data-awards-shared-votes gap={"sm"}>
          {rows.map(({ category, text, position, gameId }) => {
            const game = gamesById.get(gameId);

            return (
              <Group
                key={category.id}
                data-awards-shared-vote
                data-category-id={category.id}
                data-game-id={gameId}
                wrap={"nowrap"}
                gap={"sm"}
                className={"rounded-md border border-paper-4 bg-paper-3 p-2"}
              >
                <Text size={"xs"} c={"dimmed"} className={"w-5 shrink-0"}>
                  {formatCategoryNumber(position)}
                </Text>
                <Box className={"w-12 shrink-0"}>
                  <AwardsGameCover game={game} />
                </Box>
                <Stack gap={0} className={"min-w-0"}>
                  <Text size={"xs"} c={"dimmed"} className={"truncate"}>
                    {text.name}
                  </Text>
                  <Text fw={600} className={"truncate"}>
                    {game?.name}
                  </Text>
                </Stack>
              </Group>
            );
          })}
        </Stack>
      )}

      {signUpPanel}
    </Stack>
  );
};

export { AwardsSharedBallotScreen };
