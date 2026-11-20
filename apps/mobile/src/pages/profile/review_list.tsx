import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import {
  CenteredLoading,
  ProfileReviewListView,
  useUserProfile,
} from "@repo/ui";

interface Props {
  userId: string;
}

const ProfileReviewListPage = ({ userId }: Props) => {
  const { t } = useTranslation();
  const profileQuery = useUserProfile(userId);
  return (
    <AppPage title={t("navigation.reviews")}>
      {profileQuery.isLoading && <CenteredLoading />}
      <ProfileReviewListView userId={userId} />
    </AppPage>
  );
};

export default ProfileReviewListPage;
