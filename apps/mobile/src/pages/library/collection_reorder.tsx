import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import { Box } from "@mantine/core";
import { CollectionOrderingUpdateForm } from "@repo/ui";

interface Props {
  collectionId: string;
}

const CollectionReorderPage = ({ collectionId }: Props) => {
  const { t } = useTranslation();
  return (
    <AppPage
      title={t("navigation.collections")}
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
