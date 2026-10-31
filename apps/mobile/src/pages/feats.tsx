import { AppPage } from "@/components/general/AppPage.tsx";
import { AchievementsScreen, useUserProfile } from "@repo/ui";

interface Props {
  userId: string;
}

const AchievementsPage = ({ userId }: Props) => {
  useUserProfile(userId);
  return (
    <AppPage withSearch>
      <AchievementsScreen targetUserId={userId} />
    </AppPage>
  );
};

export default AchievementsPage;
