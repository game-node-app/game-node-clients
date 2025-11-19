import React from "react";
import { useRouter } from "next/router";
import { LibraryViewLayout, CollectionView } from "@repo/ui";
import { Stack } from "@mantine/core";

const Collection = () => {
  const router = useRouter();
  const { userId, collectionId } = router.query;
  return (
    <Stack className={"lg:my-10"}>
      <LibraryViewLayout
        userId={userId as string | undefined}
        collectionId={collectionId as string | undefined}
      >
        <CollectionView
          libraryUserId={userId as string}
          collectionId={collectionId as string}
        />
      </LibraryViewLayout>
    </Stack>
  );
};

export default Collection;
