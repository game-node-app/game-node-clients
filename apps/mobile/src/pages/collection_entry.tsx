import { AppPage } from "@/components/general/AppPage.tsx";
import { useTranslation } from "@repo/locales";
import { CollectionEntryDetailView, ImageSize, useUserProfile } from "@repo/ui";

interface Props {
  userId: string;
  collectionEntryId: string;
}

const CollectionEntryDetailPage = ({ userId, collectionEntryId }: Props) => {
  const { t } = useTranslation();
  useUserProfile(userId);

  return (
    <AppPage title={t("navigation.library")} withSearch>
      <CollectionEntryDetailView
        userId={userId}
        collectionEntryId={collectionEntryId}
        withTitle={false}
        backgroundImageSize={ImageSize.SCREENSHOT_MED}
      />
    </AppPage>
  );
};

export default CollectionEntryDetailPage;
