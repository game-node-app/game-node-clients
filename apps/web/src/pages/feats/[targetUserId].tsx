import { AchievementsScreen } from "@repo/ui";
import { useRouter } from "next/router";

export default function FeatsPage() {
  const router = useRouter();
  const query = router.query;
  const targetUserId = query.targetUserId as string;
  return <AchievementsScreen targetUserId={targetUserId} />;
}