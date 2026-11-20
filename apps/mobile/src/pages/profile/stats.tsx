import { AppPage } from "@/components/general/AppPage";
import { buildPresenterComponent, ProfileStatsView } from "@repo/ui";

const ProfileStatsPresenter = buildPresenterComponent(
  "ProfileStatsView",
  ProfileStatsView,
);

interface Props {
  userId: string;
}

const ProfileStatsPage = ({ userId }: Props) => {
  return (
    <AppPage>
      <ProfileStatsPresenter userId={userId} />
    </AppPage>
  );
};

export default ProfileStatsPage;
