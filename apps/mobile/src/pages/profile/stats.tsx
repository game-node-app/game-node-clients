import { AppPage } from "@/components/general/AppPage";
import { ProfileStatsView } from "@repo/ui";

interface Props {
  userId: string;
}

const ProfileStatsPage = ({ userId }: Props) => {
  return (
    <AppPage>
      <ProfileStatsView userId={userId} />
    </AppPage>
  );
};

export default ProfileStatsPage;