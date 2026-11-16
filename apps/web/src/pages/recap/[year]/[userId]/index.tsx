import { Stack } from "@mantine/core";
import { YearRecapScreen } from "@repo/ui";
import { useRouter } from "next/router";

const RecapPage = () => {
  const router = useRouter();
  const { year, userId } = router.query;
  const targetYear = Array.isArray(year)
    ? parseInt(year[0], 10)
    : parseInt(year || "", 10);
  const targetUserId = Array.isArray(userId) ? userId[0] : userId;

  if (!targetUserId || Number.isNaN(targetYear)) {
    return null;
  }

  return (
    <Stack className={"w-full"}>
      <YearRecapScreen year={targetYear} userId={targetUserId} />
    </Stack>
  );
};

export default RecapPage;
