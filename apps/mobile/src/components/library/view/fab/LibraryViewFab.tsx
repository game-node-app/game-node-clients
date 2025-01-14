import CollectionEntriesMoveModal from "@/components/collection/collection-entry/form/modal/CollectionEntriesMoveModal";
import CollectionCreateOrUpdateModal from "@/components/collection/form/modal/CollectionCreateOrUpdateModal";
import CollectionRemoveModal from "@/components/collection/form/modal/CollectionRemoveModal";
import { IonFab, IonFabButton, IonFabList } from "@ionic/react";
import { useDisclosure } from "@mantine/hooks";
import {
    IconDots,
    IconEdit,
    IconEditCircle,
    IconLibraryPlus,
    IconPlus,
    IconReplace,
    IconTrash,
} from "@tabler/icons-react";
import React from "react";

interface Props {
    selectedCollectionId: string | null;
}

/**
 * Must be directly under a 'IonContent' element.
 * @returns
 */
export const LibraryViewFab = ({ selectedCollectionId }: Props) => {
    const [createCollectionModalOpened, createCollectionModalUtils] = useDisclosure();
    const [updateCollectionModalOpened, updateCollectionModalUtils] = useDisclosure();
    const [moveModalOpened, moveModalUtils] = useDisclosure();
    const [removeModalOpened, removeModalUtils] = useDisclosure();

    return (
        <IonFab slot="fixed" horizontal="end" vertical="bottom" className="me-2 mb-2">
            <CollectionCreateOrUpdateModal
                opened={createCollectionModalOpened}
                onClose={() => createCollectionModalUtils.close()}
                // Needs to be undefined to open a 'create' version.
                collectionId={undefined}
            />

            <CollectionCreateOrUpdateModal
                opened={updateCollectionModalOpened}
                onClose={() => updateCollectionModalUtils.close()}
                collectionId={selectedCollectionId}
            />
            <CollectionEntriesMoveModal
                collectionId={selectedCollectionId!}
                opened={moveModalOpened}
                onClose={moveModalUtils.close}
            />
            <CollectionRemoveModal
                collectionId={selectedCollectionId!}
                opened={removeModalOpened}
                onClose={removeModalUtils.close}
            />

            <IonFabButton
                onClick={() => {
                    if (!selectedCollectionId) {
                        createCollectionModalUtils.open();
                    }
                }}
            >
                {selectedCollectionId ? <IconEdit /> : <IconLibraryPlus />}
            </IonFabButton>
            {selectedCollectionId && (
                <IonFabList side="top">
                    <IonFabButton color={"danger"} onClick={removeModalUtils.open}>
                        <IconTrash />
                    </IonFabButton>
                    <IonFabButton color={"primary"} onClick={updateCollectionModalUtils.open}>
                        <IconDots />
                    </IonFabButton>
                    <IonFabButton color="primary" onClick={moveModalUtils.open}>
                        <IconReplace />
                    </IonFabButton>
                    <IonFabButton color="primary" onClick={createCollectionModalUtils.open}>
                        <IconLibraryPlus />
                    </IonFabButton>
                </IonFabList>
            )}
        </IonFab>
    );
};

export default LibraryViewFab;
