import { useAwardEventCategories } from "#@/components/awards/hooks/useAwardEventCategories";
import { useAwardsBallot } from "#@/components/awards/hooks/useAwardsBallot";
import { useCurrentAwardsEvent } from "#@/components/awards/hooks/useCurrentAwardsEvent";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useFormatLocale } from "#@/components/events/util/format";
import { getAwardsEntry } from "#@/components/events/util/seasonEvents";
import { useGames } from "#@/components/game/hooks/useGames";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { GameNodeLogo } from "#@/components/general/GameNodeLogo";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { useRecap } from "#@/components/recap/hooks/useRecap";
import { useRecapStatus } from "#@/components/recap/hooks/useRecapStatus";
import {
  getAvailableRecapStoryIds,
  getRecapGotyProgress,
  resolveRecapStoryIndex,
  type RecapStoryId,
} from "#@/components/recap/stories/recapStories";
import { RecapStoryCalendar } from "#@/components/recap/stories/RecapStoryCalendar";
import { RecapStoryCommunity } from "#@/components/recap/stories/RecapStoryCommunity";
import { RecapStoryFinal } from "#@/components/recap/stories/RecapStoryFinal";
import { RecapStoryOpening } from "#@/components/recap/stories/RecapStoryOpening";
import { RecapStoryTopGame } from "#@/components/recap/stories/RecapStoryTopGame";
import { RecapCardFonts } from "#@/components/wrapped/card/RecapCardFonts";
import { RecapCardPreview } from "#@/components/wrapped/card/RecapCardPreview";
import { exportCardImage } from "#@/components/wrapped/util/exportCardImage";
import { useAuthPath } from "#@/context";
import {
  createErrorNotification,
  isNotFoundApiError,
  Link,
  useRouter,
} from "#@/util";
import { ActionIcon, Button, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";

export interface RecapStoriesScreenProps {
  /** Owner of the Recap; also the id in the page route. */
  userId: string;
  year: number;
  /**
   * Hands the exported PNG to the app share sheet. It must reject when sharing
   * fails, which shows the error notification and keeps the viewer open.
   */
  onShare: (file: File) => Promise<void>;
}

const BAR_STYLE = {
  height: 4,
  flex: 1,
  borderRadius: 999,
  background: "rgba(255, 255, 255, 0.16)",
  overflow: "hidden",
} as const;

const BAR_FILL_STYLE = {
  height: "100%",
  borderRadius: 999,
} as const;

/**
 * Full-screen viewer of the five Recap stories (design §11).
 *
 * The story is drawn at its native 1080x1920 inside `RecapCardPreview`; the
 * viewer chrome — progress bars, brand, close, "n / 5" and the actions — sits
 * outside the exported node, so the PNG is exactly the card. Navigation is by
 * tapping the left/right halves of the card; there is no timer.
 */
export function RecapStoriesScreen({
  userId,
  year,
  onShare,
}: RecapStoriesScreenProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const router = useRouter();
  const authPath = useAuthPath();
  const cardRef = useRef<HTMLDivElement>(null);

  const loggedUserId = useUserId();
  const isOwner = !!loggedUserId && loggedUserId === userId;
  const isVisitor = !loggedUserId;

  const statusQuery = useRecapStatus(userId, year);
  const recapQuery = useRecap(userId, year, {
    enabled: statusQuery.data?.isRecapCreated === true,
  });
  const recap = recapQuery.data;
  const username = useUserProfile(userId).data?.username;

  // Every story reuses the games the Recap page loads: the top five covers and
  // the two community highlight games, in one batched read.
  const gameIds = useMemo(() => {
    if (!recap) return [];
    const ids = recap.topGames.slice(0, 5).map((top) => top.gameId);
    const highlights = recap.communityHighlights;
    if (highlights?.minority) ids.push(highlights.minority.gameId);
    if (highlights?.inTune) ids.push(highlights.inTune.gameId);
    return [...new Set(ids)];
  }, [recap]);
  const gamesQuery = useGames(
    { gameIds, relations: { cover: true } },
    false,
    "off",
  );
  const games = gamesQuery.data ?? [];

  // Awards action of the last story: the owner of the Recap, the same year and
  // the `voting` phase (design §11). The ballot and categories are only read
  // for that case.
  const awardsEventQuery = useCurrentAwardsEvent();
  const awardsEvent = awardsEventQuery.data ?? null;
  const votingEventId =
    isOwner &&
    isSameRecapYear(awardsEvent, recap) &&
    awardsEvent?.phase === "voting"
      ? awardsEvent.id
      : undefined;
  const ballotQuery = useAwardsBallot(votingEventId);
  const categoriesQuery = useAwardEventCategories(votingEventId);
  const awardsEntry = getAwardsEntry(
    awardsEvent,
    ballotQuery.data,
    categoriesQuery.data,
    new Date(),
  );
  const gotyProgress = getRecapGotyProgress(
    ballotQuery.data,
    categoriesQuery.data,
  );
  const canVote =
    isOwner && awardsEntry?.kind === "voting" && gotyProgress != null;

  // Stories without data are filtered before numbering, so "n / 5" becomes
  // "n / 4" when one is skipped (spec: Dados dos stories).
  const storyIds = useMemo(() => getAvailableRecapStoryIds(recap), [recap]);
  const requestedStory = router.query.get("story");
  const initialIndex = resolveRecapStoryIndex(storyIds, requestedStory);
  const [selectedId, setSelectedId] = useState<RecapStoryId | null>(null);
  const selectedIndex = selectedId ? storyIds.indexOf(selectedId) : -1;
  const index = selectedIndex >= 0 ? selectedIndex : initialIndex;
  const currentStoryId = storyIds[index];
  const isLastStory = index === storyIds.length - 1;

  const shareMutation = useMutation({
    mutationFn: async () => {
      const node = cardRef.current;
      if (!node) {
        throw new Error(t("recap.stories.errors.export"));
      }

      const file = await exportCardImage(node, "story", {
        type: "image/png",
        filenamePrefix: "gamenode-story",
      });

      await onShare(file);
    },
    onError: createErrorNotification,
  });

  const goToStory = (nextIndex: number) => {
    const next = storyIds[nextIndex];
    if (next) setSelectedId(next);
  };

  if (
    statusQuery.isPending ||
    (statusQuery.data?.isRecapCreated === true && recapQuery.isPending)
  ) {
    return <CenteredLoading />;
  }

  if (statusQuery.isError) {
    const isHidden = isNotFoundApiError(statusQuery.error);

    return (
      <StoriesMessage
        year={year}
        userId={userId}
        message={
          isHidden
            ? t("libraryVisibility.hidden.title")
            : t("recap.page.states.errorTitle")
        }
        description={
          isHidden
            ? t("libraryVisibility.hidden.description")
            : t("recap.page.states.errorDescription")
        }
        backLabel={t("recap.stories.back")}
      />
    );
  }

  if (statusQuery.data && !statusQuery.data.isRecapCreated) {
    return (
      <StoriesMessage
        year={year}
        userId={userId}
        message={t("recap.messages.generating")}
        backLabel={t("recap.stories.back")}
      />
    );
  }

  if (!recap) {
    if (isNotFoundApiError(recapQuery.error)) {
      return (
        <StoriesMessage
          year={year}
          userId={userId}
          message={t("libraryVisibility.hidden.title")}
          description={t("libraryVisibility.hidden.description")}
          backLabel={t("recap.stories.back")}
        />
      );
    }

    return <CenteredLoading />;
  }

  if (storyIds.length === 0) {
    return (
      <StoriesMessage
        year={year}
        userId={userId}
        message={t("recap.stories.empty")}
        backLabel={t("recap.stories.back")}
      />
    );
  }

  const renderStory = (storyId: RecapStoryId) => {
    switch (storyId) {
      case "opening":
        return (
          <RecapStoryOpening recap={recap} games={games} locale={locale} />
        );
      case "topGame":
        return (
          <RecapStoryTopGame recap={recap} games={games} locale={locale} />
        );
      case "calendar":
        return <RecapStoryCalendar recap={recap} locale={locale} />;
      case "community":
        return (
          <RecapStoryCommunity recap={recap} games={games} locale={locale} />
        );
      case "final":
        return (
          <RecapStoryFinal
            recap={recap}
            games={games}
            username={username}
            locale={locale}
          />
        );
    }
  };

  const shareLabel = isLastStory
    ? t("recap.stories.shareStory")
    : t("recap.stories.share");
  const progressLabel = t("recap.stories.progress", {
    current: index + 1,
    total: storyIds.length,
  });
  const awardsYear = awardsEvent?.year ?? year;
  const authHref = `${authPath}?redirectTo=${encodeURIComponent(
    router.asPath ?? router.pathname,
  )}`;

  return (
    <div
      data-testid={"recap-stories"}
      className={"mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 pb-8 pt-3"}
    >
      <RecapCardFonts />

      <div className={"flex w-full items-center gap-2"} aria-hidden>
        {storyIds.map((storyId, storyIndex) => (
          <div
            key={storyId}
            style={BAR_STYLE}
            data-testid={"recap-story-bar"}
            data-active={storyIndex === index}
          >
            <div
              style={{
                ...BAR_FILL_STYLE,
                width: storyIndex <= index ? "100%" : "0%",
                background:
                  storyIndex === index
                    ? "var(--gn-brand)"
                    : "color-mix(in srgb, var(--gn-brand) 60%, transparent)",
              }}
            />
          </div>
        ))}
      </div>

      <div className={"flex w-full items-center justify-between"}>
        <GameNodeLogo style={{ height: 26, width: "auto" }} />
        <ActionIcon
          variant={"subtle"}
          color={"gray"}
          size={"lg"}
          aria-label={t("recap.stories.close")}
          onClick={() => void router.push(`/recap/${year}/${userId}`)}
        >
          <IconX />
        </ActionIcon>
      </div>

      <div className={"relative w-full"}>
        <RecapCardPreview format={"story"} cardRef={cardRef}>
          {currentStoryId && renderStory(currentStoryId)}
        </RecapCardPreview>
        <button
          type={"button"}
          aria-label={t("recap.stories.previous")}
          className={"absolute left-0 top-0 h-full w-1/2 cursor-w-resize"}
          style={{ background: "transparent" }}
          disabled={index === 0}
          onClick={() => goToStory(index - 1)}
        />
        <button
          type={"button"}
          aria-label={t("recap.stories.next")}
          className={"absolute right-0 top-0 h-full w-1/2 cursor-e-resize"}
          style={{ background: "transparent" }}
          disabled={isLastStory}
          onClick={() => goToStory(index + 1)}
        />
      </div>

      <Text size={"sm"} c={"dimmed"} ta={"center"}>
        {progressLabel}
      </Text>

      <Stack gap={"xs"}>
        <Button
          size={"md"}
          onClick={() => shareMutation.mutate()}
          loading={shareMutation.isPending}
          disabled={shareMutation.isPending}
        >
          {shareLabel}
        </Button>

        {isLastStory && canVote && awardsEntry && (
          <Stack gap={6}>
            <Link href={awardsEntry.href}>
              <Button size={"md"} variant={"light"} fullWidth>
                {t("recap.stories.final.voteAwards", { year: awardsYear })}
              </Button>
            </Link>
            {gotyProgress && (
              <Text size={"sm"} c={"dimmed"} ta={"center"}>
                {t("recap.stories.final.gotyProgress", {
                  played: gotyProgress.played,
                  total: gotyProgress.total,
                })}
              </Text>
            )}
          </Stack>
        )}

        {isLastStory && isVisitor && (
          <Link href={authHref}>
            <Button size={"md"} variant={"light"} fullWidth>
              {t("recap.stories.final.guestInvite")}
            </Button>
          </Link>
        )}
      </Stack>
    </div>
  );
}

/** Whether the current Awards event is the Recap's year. */
function isSameRecapYear(
  event: { year: number } | null,
  recap: { year: number } | null | undefined,
): boolean {
  return !!event && !!recap && event.year === recap.year;
}

function StoriesMessage({
  year,
  userId,
  message,
  description,
  backLabel,
}: {
  year: number;
  userId: string;
  message: string;
  description?: string;
  backLabel: string;
}) {
  return (
    <Stack className={"mx-auto w-full max-w-xl items-center gap-4 py-16"}>
      <Text c={"dimmed"} ta={"center"}>
        {message}
      </Text>
      {description && (
        <Text size={"sm"} c={"dimmed"} ta={"center"}>
          {description}
        </Text>
      )}
      <Link href={`/recap/${year}/${userId}`}>
        <Button variant={"light"}>{backLabel}</Button>
      </Link>
    </Stack>
  );
}
