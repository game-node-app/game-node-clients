import React from "react";
import { useRouter } from "next/router";
import CollectionView from "@/components/collection/view/CollectionView";
import { LibraryView } from "@repo/ui";

const Collection = () => {
  const router = useRouter();
  const { userId, collectionId } = router.query;
  return (
    <LibraryView
      userId={userId as string | undefined}
      collectionId={collectionId as string | undefined}
      onChange={() => {}}
    >
      <CollectionView
        libraryUserId={userId as string}
        collectionId={collectionId as string}
      />
    </LibraryView>
  );
};

export default Collection;
