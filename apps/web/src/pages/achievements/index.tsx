import { Stack } from "@mantine/core";
import { CenteredLoading, SessionAuth, useUserId } from "@repo/ui";
import { useRouter } from "next/router";
import { useEffect } from "react";

const RedirectToOwnAchievements = () => {
  const router = useRouter();
  const userId = useUserId();

  useEffect(() => {
    if (userId) {
      router.replace(`/achievements/${userId}`, undefined, { shallow: true });
    }
  }, [router, userId]);

  return (
    <Stack className={"w-full mb-4 h-screen"}>
      <CenteredLoading />
    </Stack>
  );
};

const JournalAchievementsIndexPage = () => (
  <SessionAuth>
    <RedirectToOwnAchievements />
  </SessionAuth>
);

export default JournalAchievementsIndexPage;
