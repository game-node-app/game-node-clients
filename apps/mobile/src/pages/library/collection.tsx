import { AppPage } from "@/components/general/AppPage.tsx";
import { useTranslation } from "@repo/locales";
import LibraryViewFab from "@/components/library/fab/LibraryViewFab.tsx";
import { LibraryViewRefresher } from "@/components/library/LibraryViewRefresher.tsx";
import {
  CollectionView,
  LibraryViewLayout,
  useCollection,
  useUserId,
  useUserProfile,
} from "@repo/ui";
import { SessionAuth } from "@repo/ui";

interface Props {
  userId: string;
  collectionId: string;
}

const CollectionPage = ({ userId, collectionId }: Props) => {
  const { t } = useTranslation();
  const ownUserId = useUserId();
  const isOwnLibrary = userId === ownUserId;

  useUserProfile(userId);
  useCollection(collectionId);

  return (
    <AppPage
      title={t("navigation.collections")}
      contentProps={{
        fixedSlotPlacement: "before",
      }}
    >
      <SessionAuth requireAuth={userId == undefined}>
        <LibraryViewRefresher userId={userId} collectionId={collectionId} />
        {isOwnLibrary && <LibraryViewFab />}
        <LibraryViewLayout userId={userId} collectionId={collectionId}>
          <CollectionView libraryUserId={userId} collectionId={collectionId} />
        </LibraryViewLayout>
      </SessionAuth>
    </AppPage>
  );
};

export default CollectionPage;
