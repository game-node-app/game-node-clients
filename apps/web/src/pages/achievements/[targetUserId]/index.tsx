import React from "react";
import { useRouter } from "next/router";
import { Stack } from "@mantine/core";
import { JournalObtainedAchievementsView } from "@repo/ui";

const JournalAchievementsPage = () => {
  const router = useRouter();
  const { targetUserId } = router.query;

  if (targetUserId === undefined || typeof targetUserId !== "string") {
    return null;
  }

  return (
    <Stack className={"w-full my-4"}>
      <JournalObtainedAchievementsView
        userId={targetUserId as string}
        withUserInfo
      />
    </Stack>
  );
};

export default JournalAchievementsPage;
