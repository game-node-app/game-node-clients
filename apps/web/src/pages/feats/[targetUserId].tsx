import { useRouter } from "next/router";
import { Box, Center } from "@mantine/core";
import { AchievementsScreen } from "@repo/ui";

export default function FeatsPage() {
  const router = useRouter();
  const query = router.query;
  const targetUserId = query.targetUserId as string;
  return <AchievementsScreen targetUserId={targetUserId} />;
}
