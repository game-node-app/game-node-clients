import React from "react";
import { useRouter } from "next/router";
import { Flex, Stack } from "@mantine/core";
import { RecapStatsScreen } from "@repo/ui";

const RecapStatsPage = () => {
  const router = useRouter();
  const { year, userId } = router.query;
  const targetYear = Array.isArray(year)
    ? parseInt(year[0], 10)
    : parseInt(year || "", 10);
  const targetUserId = Array.isArray(userId) ? userId[0] : userId;

  return (
    <Stack className={"w-full mb-20"}>
      <RecapStatsScreen userId={targetUserId!} targetYear={targetYear!} />
    </Stack>
  );
};

export default RecapStatsPage;
