import { AppPage } from "@/components/general/AppPage";
import { Box } from "@mantine/core";
import { CollectionOrderingUpdateForm } from "@repo/ui";

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