import { AppPage } from "@/components/general/AppPage.tsx";
import { CollectionEntryDetailView, ImageSize, useUserProfile } from "@repo/ui";

interface Props {
  userId: string;
  collectionEntryId: string;
}

const CollectionEntryDetailPage = ({ userId, collectionEntryId }: Props) => {
  useUserProfile(userId);

  return (
    <AppPage withSearch>
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
