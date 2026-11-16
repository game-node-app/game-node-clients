import { Stack } from "@mantine/core";
import { AwardsSharedBallotScreen } from "@repo/ui";
import { useRouter } from "next/router";

const AwardsUserNomineesPage = () => {
  const router = useRouter();
  const { year, userId } = router.query;

  const eventYear = Number.parseInt(year as string);
  const ballotUserId = userId as string | undefined;

  if (!Number.isFinite(eventYear) || !ballotUserId) {
    return null;
  }

  return (
    <Stack className={"w-full mb-12"}>
      <AwardsSharedBallotScreen
        eventYear={eventYear}
        userId={ballotUserId}
      />
    </Stack>
  );
};

export default AwardsUserNomineesPage;
