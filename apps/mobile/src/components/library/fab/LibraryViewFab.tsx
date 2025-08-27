import { IonFab, IonFabButton } from "@ionic/react";
import { useDisclosure } from "@mantine/hooks";
import { CollectionCreateOrUpdateModal } from "@repo/ui";
import { IconLibraryPlus } from "@tabler/icons-react";
import React from "react";

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
      className="me-2 mb-2"
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
