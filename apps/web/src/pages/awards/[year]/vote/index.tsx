import React from "react";
import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { AwardsBallotScreen } from "@repo/ui";
import { useRouter } from "next/router";
import { OpenGraph } from "@/components/general/OpenGraph";

/** Rendered per request so the route parameters reach the page's metadata. */
export const getServerSideProps = async () => ({ props: {} });

const AwardsEventVotePage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { year } = router.query;
  const eventYear = Number.parseInt(year as string, 10);

  return (
    <Stack>
      <OpenGraph
        title={t("seo.awards.voteTitle", { year: eventYear })}
        description={t("seo.awards.description", { year: eventYear })}
      />
      <AwardsBallotScreen
        eventYear={eventYear}
        onShare={async (file) => {
          if (!navigator.share) {
            throw new Error(t("awards.ballot.shareModal.shareUnsupported"));
          }

          const toShare = {
            title: t("awards.ballot.title"),
            files: [file],
          };

          if (navigator.canShare && !navigator.canShare(toShare)) {
            throw new Error(t("awards.ballot.shareModal.shareUnsupported"));
          }

          try {
            await navigator.share(toShare);
          } catch (error) {
            if ((error as Error).name === "AbortError") {
              return;
            }
            throw error;
          }
        }}
      />
    </Stack>
  );
};

export default AwardsEventVotePage;
