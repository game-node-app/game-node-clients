import React from "react";
import { useRouter } from "next/router";
import { LibraryViewLayout, CollectionView } from "@repo/ui";

const Collection = () => {
  const router = useRouter();
  const { userId, collectionId } = router.query;
  return (
    <LibraryViewLayout
      userId={userId as string | undefined}
      collectionId={collectionId as string | undefined}
    >
      <CollectionView
        libraryUserId={userId as string}
        collectionId={collectionId as string}
      />
    </LibraryViewLayout>
  );
};

export default Collection;
