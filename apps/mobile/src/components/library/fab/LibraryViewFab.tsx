import { IonFab, IonFabButton } from "@ionic/react";
import { useDisclosure } from "@mantine/hooks";
import { CollectionCreateOrUpdateModal } from "@repo/ui";
import { IconLibraryPlus } from "@tabler/icons-react";

/**
 * Must be directly under a 'IonContent' element.
 * @returns
 */
export const LibraryViewFab = () => {
  const [createCollectionModalOpened, createCollectionModalUtils] =
    useDisclosure();

  return (
    <IonFab
      slot="fixed"
      horizontal="end"
      vertical="bottom"
      // The tab bar floats over the page (64px + 8px offset), so lift the FAB clear of it.
      style={{ marginBottom: "calc(80px + env(safe-area-inset-bottom))" }}
      className="me-2"
    >
      <CollectionCreateOrUpdateModal
        opened={createCollectionModalOpened}
        onClose={() => createCollectionModalUtils.close()}
        // Needs to be undefined to open a 'create' version.
        collectionId={undefined}
      />

      <IonFabButton
        onClick={() => {
          createCollectionModalUtils.open();
        }}
      >
        <IconLibraryPlus />
      </IonFabButton>
    </IonFab>
  );
};

export default LibraryViewFab;