import { useUserId } from "#@/components/auth/hooks/useUserId";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { LibraryHiddenState } from "#@/components/library/view/LibraryHiddenState";
import { useRecap } from "#@/components/recap/hooks/useRecap";
import { useRecapStatus } from "#@/components/recap/hooks/useRecapStatus";
import { RecapBacklogSection } from "#@/components/recap/year/RecapBacklogSection";
import { RecapCalendarSection } from "#@/components/recap/year/RecapCalendarSection";
import { RecapCommunitySection } from "#@/components/recap/year/RecapCommunitySection";
import { RecapFooter } from "#@/components/recap/year/RecapFooter";
import { RecapHero } from "#@/components/recap/year/RecapHero";
import { RecapTopGamesSection } from "#@/components/recap/year/RecapTopGamesSection";
import { markRecapVisited } from "#@/components/recap/year/util/recapVisited";
import { SeasonEventHeader } from "#@/components/events/view/SeasonEventHeader";
import { Button, Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { isNotFoundApiError } from "#@/util";
import { useEffect, type ReactNode } from "react";

export interface YearRecapScreenProps {
  year: number;
  userId: string;
}

/**
 * Public 2026 Recap page (frame 5415:922, design §10).
 *
 * The status read decides the state: a Recap that was not generated yet never
 * calls the Recap read, and a non-eligible user gets the "no Recap" notice. The
 * owner's visit is marked locally so the Dock can stop showing the "Nova" badge.
 */
export function YearRecapScreen({ year, userId }: YearRecapScreenProps) {
  const { t } = useTranslation();
  const statusQuery = useRecapStatus(userId, year);
  const status = statusQuery.data;
  const recapQuery = useRecap(userId, year, {
    enabled: status?.isRecapCreated === true,
  });
  const recap = recapQuery.data;
  const loggedUserId = useUserId();
  const isOwner = !!loggedUserId && loggedUserId === userId;

  useEffect(() => {
    if (isOwner && recap) markRecapVisited(year);
  }, [isOwner, recap, year]);

  const content = (() => {
    if (statusQuery.isPending) {
      return <CenteredLoading />;
    }

    if (statusQuery.isError) {
      // A hidden library answers 404: the Recap is not visible to this viewer.
      if (!isOwner && isNotFoundApiError(statusQuery.error)) {
        return <LibraryHiddenState userId={userId} />;
      }

      return (
        <RecapStateNotice
          title={t("recap.page.states.errorTitle")}
          description={t("recap.page.states.errorDescription")}
          action={
            <Button variant={"default"} onClick={() => statusQuery.refetch()}>
              {t("recap.page.states.retry")}
            </Button>
          }
        />
      );
    }

    if (!status?.isRecapCreated) {
      return status?.isRecapEligible ? (
        <RecapStateNotice
          title={t("recap.page.states.notReadyTitle", { year })}
          description={t("recap.page.states.notReadyDescription")}
        />
      ) : (
        <RecapStateNotice
          title={t("recap.page.states.notEligibleTitle", { year })}
          description={t("recap.page.states.notEligibleDescription")}
        />
      );
    }

    if (recapQuery.isPending) {
      return <CenteredLoading />;
    }

    if (!recap) {
      if (!isOwner && isNotFoundApiError(recapQuery.error)) {
        return <LibraryHiddenState userId={userId} />;
      }

      return (
        <RecapStateNotice
          title={t("recap.page.states.errorTitle")}
          description={t("recap.page.states.errorDescription")}
          action={
            <Button variant={"default"} onClick={() => recapQuery.refetch()}>
              {t("recap.page.states.retry")}
            </Button>
          }
        />
      );
    }

    return (
      <>
        <RecapHero year={year} recap={recap} phase={status.phase} />
        <RecapTopGamesSection year={year} recap={recap} />
        <RecapCalendarSection year={year} recap={recap} />
        <RecapCommunitySection recap={recap} />
        <RecapBacklogSection year={year} recap={recap} userId={userId} />
        <RecapFooter year={year} recap={recap} userId={userId} />
      </>
    );
  })();

  return (
    <div
      data-testid={"year-recap-screen"}
      className={
        "mx-auto flex w-full max-w-[1200px] flex-col px-4 pb-16 md:px-6"
      }
    >
      <SeasonEventHeader year={year} screen={"recap"} />
      {content}
    </div>
  );
}

function RecapStateNotice({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Paper
      withBorder
      radius={"lg"}
      p={{ base: "md", md: "xl" }}
      className={"mt-8 bg-paper-0"}
    >
      <Stack gap={"sm"} align={"flex-start"}>
        <Title order={2} size={"h3"}>
          {title}
        </Title>
        <Text size={"sm"} c={"dimmed"}>
          {description}
        </Text>
        {action}
      </Stack>
    </Paper>
  );
}

export { RecapStateNotice };
