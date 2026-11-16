import React from "react";
import { Stack } from "@mantine/core";
import { AwardsNominationsScreen } from "@repo/ui";
import { useRouter } from "next/router";

const AwardsNominationsPage = () => {
  const router = useRouter();
  const { year } = router.query;

  return (
    <Stack>
      <AwardsNominationsScreen eventYear={Number.parseInt(year as string)} />
    </Stack>
  );
};

export default AwardsNominationsPage;
