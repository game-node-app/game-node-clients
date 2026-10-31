import { ProfileStatsView } from "@repo/ui";
import { useRouter } from "next/router";

const ProfileStatsPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  return <ProfileStatsView userId={userId as string} />;
};

export default ProfileStatsPage;