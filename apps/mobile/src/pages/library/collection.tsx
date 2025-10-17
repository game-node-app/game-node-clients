import React from "react";
import {
  CollectionView,
  LibraryViewLayout,
  useCollection,
  useRouter,
  useUserId,
  useUserProfile,
} from "@repo/ui";
import LibraryViewFab from "@/components/library/fab/LibraryViewFab.tsx";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { LibraryViewRefresher } from "@/components/library/LibraryViewRefresher.tsx";
import { AppPage } from "@/components/general/AppPage.tsx";

interface Props {
  userId: string;
  collectionId: string;
}

const CollectionPage = ({ userId, collectionId }: Props) => {
  const router = useRouter();
  const ownUserId = useUserId();
  const isOwnLibrary = userId === ownUserId;

  useUserProfile(userId);
  useCollection(collectionId);

  return (
    <AppPage
      contentProps={{
        fixedSlotPlacement: "before",
      }}
    >
      <SessionAuth requireAuth={userId == undefined}>
        <LibraryViewRefresher userId={userId} collectionId={collectionId} />
        {isOwnLibrary && <LibraryViewFab />}
        <LibraryViewLayout userId={userId} collectionId={collectionId}>
          <CollectionView
            libraryUserId={userId}
            collectionId={collectionId}
            onReorderButtonClick={() => {
              router.push(
                `/library/${userId}/collection/${collectionId}/reorder`,
              );
            }}
          />
        </LibraryViewLayout>
      </SessionAuth>
    </AppPage>
  );
};

export default CollectionPage;
