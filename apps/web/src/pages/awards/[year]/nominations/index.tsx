import React from "react";
import { Stack } from "@mantine/core";
import { AwardsNominationsScreen } from "@repo/ui";
import { useRouter } from "next/router";
import { useTranslation } from "@repo/locales";
import { OpenGraph } from "@/components/general/OpenGraph";

/** Rendered per request so the route parameters reach the page's metadata. */
export const getServerSideProps = async () => ({ props: {} });

const AwardsNominationsPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { year } = router.query;

  return (
    <Stack>
      <OpenGraph
        title={t("seo.awards.nominationsTitle", { year })}
        description={t("seo.awards.description", { year })}
      />
      <AwardsNominationsScreen eventYear={Number.parseInt(year as string)} />
    </Stack>
  );
};

export default AwardsNominationsPage;
