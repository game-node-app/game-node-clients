import { Button, Skeleton, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconTrophyOff } from "@tabler/icons-react";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ErrorState } from "#@/components/general/ErrorState";
import { useDailyImportOnLogin } from "#@/components/daily/hooks/useDailyImportOnLogin";
import { useDailyPlay } from "#@/components/daily/hooks/useDailyPlay";
import { useDailyToday } from "#@/components/daily/hooks/useDailyToday";
import { DailyRankingSignInCard } from "#@/components/daily/ranking/DailyRankingSignInCard";
import { DailySharePanel } from "#@/components/daily/result/DailyResultPanel";
import { DailyBackToHubButton } from "#@/components/daily/view/DailyBackToHubButton";
import { DailyErrorState } from "#@/components/daily/view/DailyErrorState";
import { DailyHowToPlayModal } from "#@/components/daily/view/DailyHowToPlayModal";
import { DailyPlayBoard } from "#@/components/daily/view/DailyPlayBoard";
import { DailyPlayHeader } from "#@/components/daily/view/DailyPlayHeader";
import { DailyWeeklyFriendsRanking } from "#@/components/daily/weekly/DailyWeeklyFriendsRanking";
import { Link } from "#@/util/link";

/**
 * This week's challenge: one hard puzzle, played like a daily mode, ranked among friends.
 */
const DailyWeeklyView = () => {
  const { t } = useTranslation();
  useDailyImportOnLogin();
  const userId = useUserId();
  const todayQuery = useDailyToday();
  const weekly = todayQuery.data?.weekly;
  const play = useDailyPlay(weekly?.id, { kind: "weekly" });
  const [howToPlayOpened, howToPlay] = useDisclosure(false);
  const { data } = play;

  if (todayQuery.isError || play.isError) {
    return (
      <DailyErrorState
        onRetry={() =>
          todayQuery.isError ? todayQuery.refetch() : play.refetch()
        }
        retrying={todayQuery.isFetching || play.isFetching}
        backHref={"/daily"}
        backLabel={t("daily.result.backToHub")}
      />
    );
  }
  if (todayQuery.isSuccess && !weekly) {
    return (
      <ErrorState
        icon={IconTrophyOff}
        color={"gray"}
        title={t("daily.weekly.none")}
        actions={
          <Button component={Link} href={"/daily"} variant={"default"}>
            {t("daily.result.backToHub")}
          </Button>
        }
      />
    );
  }
  if (!weekly || !data) {
    return (
      <Stack className={"w-full max-w-[640px] mx-auto mb-8 items-center"}>
        <Skeleton h={48} />
        <Skeleton h={72} maw={400} />
        <Skeleton h={400} maw={300} />
      </Stack>
    );
  }

  const specs = data.mode === "specs";
  const title = t("daily.weekly.titleNumber", { number: weekly.number });

  return (
    <Stack
      className={"w-full mx-auto mb-8 pt-2 sm:pt-6 items-center gap-6"}
      maw={specs ? 1080 : 760}
    >
      <DailyPlayHeader
        title={title}
        subtitle={t(`daily.modes.${data.mode}.name`)}
        countdown={{
          endsAt: weekly.endsAt,
          label: t("daily.weekly.endsInLabel"),
          format: "remaining",
        }}
        onHowToPlay={howToPlay.open}
      />
      <Stack className={"w-full gap-5"} maw={specs ? undefined : 640}>
        <DailyPlayBoard
          play={data}
          onGuess={play.guess}
          onSkip={play.skip}
          onUseHint={play.useHint}
          submitting={play.isSubmitting}
        >
          <DailySharePanel play={data} title={title} />
        </DailyPlayBoard>
        {userId ? (
          <DailyWeeklyFriendsRanking />
        ) : (
          <DailyRankingSignInCard
            redirectTo={"/daily/weekly"}
            title={t("daily.weekly.friends.signInTitle")}
            description={t("daily.weekly.friends.signInDescription")}
            className={"shadow-none"}
          />
        )}
        <DailyBackToHubButton />
      </Stack>
      <DailyHowToPlayModal opened={howToPlayOpened} onClose={howToPlay.close} />
    </Stack>
  );
};

export { DailyWeeklyView };
