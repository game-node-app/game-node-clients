import { Stack } from "@mantine/core";
import { CenteredLoading } from "@repo/ui";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { redirectToAuth } from "supertokens-auth-react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";

const JournalAchievementsIndexPage = () => {
  const router = useRouter();
  const session = useSessionContext();

  useEffect(() => {
    if (session.loading) {
      return;
    }

    if (!session.doesSessionExist) {
      redirectToAuth();
    }

    if (session.userId) {
      router.replace(`/achievements/${session.userId}`, undefined, {
        shallow: true,
      });
    }
  }, [router, session]);

  return (
    <Stack className={"w-full mb-4 h-screen"}>
      <CenteredLoading />
    </Stack>
  );
};

export default JournalAchievementsIndexPage;