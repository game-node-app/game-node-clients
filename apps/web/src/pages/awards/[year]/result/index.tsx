import React from "react";
import { Stack } from "@mantine/core";
import { AwardsResultsScreen } from "@repo/ui";
import { useRouter } from "next/router";

const AwardsResultPage = () => {
  const router = useRouter();
  const { year } = router.query;

  return (
    <Stack>
      <AwardsResultsScreen eventYear={Number.parseInt(year as string)} />
    </Stack>
  );
};

export default AwardsResultPage;
