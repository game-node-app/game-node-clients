import React from "react";
import { AppPage } from "@/components/general/AppPage";
import { CollectionOrderingUpdateForm } from "@repo/ui";
import { Box } from "@mantine/core";

interface Props {
  collectionId: string;
}

const CollectionReorderPage = ({ collectionId }: Props) => {
  return (
    <AppPage
      withSearch={false}
      contentProps={{
        scrollY: false,
      }}
    >
      <Box
        className={
          "ion-content-scroll-host overflow-y-auto h-full min-h-[90dvh]"
        }
      >
        <CollectionOrderingUpdateForm collectionId={collectionId} />
      </Box>
    </AppPage>
  );
};

export default CollectionReorderPage;
