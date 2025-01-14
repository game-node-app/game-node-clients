import React, { useEffect } from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import CollectionCreateOrUpdateForm from "@/components/collection/form/CollectionCreateOrUpdateForm";
import { Container, Modal } from "@mantine/core";
import { useCollection } from "@/components/collection/hooks/useCollection";
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from "@ionic/react";

interface ICreateCollectionModalProps extends BaseModalProps {
    /**
     * Existing collection id (for update actions)
     */
    collectionId?: string | null;
}

const CollectionCreateOrUpdateModal = ({ opened, onClose, collectionId }: ICreateCollectionModalProps) => {
    return (
        <IonModal isOpen={opened} onDidDismiss={onClose} initialBreakpoint={0.75} breakpoints={[0, 0.25, 0.5, 0.75, 1]}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{collectionId ? "Update" : "Create"} collection</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Container fluid className="my-4">
                    <CollectionCreateOrUpdateForm onClose={onClose} collectionId={collectionId} />
                </Container>
            </IonContent>
        </IonModal>
    );
};

export default CollectionCreateOrUpdateModal;
