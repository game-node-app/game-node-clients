import React from "react";
import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { AwardsBallotScreen } from "@repo/ui";
import { useRouter } from "next/router";

const AwardsEventVotePage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { year } = router.query;
  const eventYear = Number.parseInt(year as string, 10);

  return (
    <Stack>
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
