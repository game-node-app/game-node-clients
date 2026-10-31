import { AppPage } from "@/components/general/AppPage";
import {
  CenteredLoading,
  ProfileReviewListView,
  useUserProfile,
} from "@repo/ui";

interface Props {
  userId: string;
}

const ProfileReviewListPage = ({ userId }: Props) => {
  const profileQuery = useUserProfile(userId);
  return (
    <AppPage>
      {profileQuery.isLoading && <CenteredLoading />}
      <ProfileReviewListView userId={userId} />
    </AppPage>
  );
};

export default ProfileReviewListPage;