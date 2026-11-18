import React from "react";
import { Stack } from "@mantine/core";
import { AwardsResultsScreen } from "@repo/ui";
import { useRouter } from "next/router";
import { useTranslation } from "@repo/locales";
import { OpenGraph } from "@/components/general/OpenGraph";

/** Rendered per request so the route parameters reach the page's metadata. */
export const getServerSideProps = async () => ({ props: {} });

const AwardsResultPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { year } = router.query;

  return (
    <Stack>
      <OpenGraph
        title={t("seo.awards.resultsTitle", { year })}
        description={t("seo.awards.resultsDescription", { year })}
      />
      <AwardsResultsScreen eventYear={Number.parseInt(year as string)} />
    </Stack>
  );
};

export default AwardsResultPage;
