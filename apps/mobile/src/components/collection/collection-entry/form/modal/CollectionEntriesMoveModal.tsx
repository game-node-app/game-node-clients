import React from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import { Container, Modal } from "@mantine/core";
import CollectionEntriesMoveForm from "@/components/collection/collection-entry/form/CollectionEntriesMoveForm";
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from "@ionic/react";

interface Props extends BaseModalProps {
    collectionId: string;
}

const CollectionEntriesMoveModal = ({ opened, onClose, collectionId }: Props) => {
    return (
        <IonModal isOpen={opened} onDidDismiss={onClose} initialBreakpoint={0.75} breakpoints={[0, 0.25, 0.5, 0.75, 1]}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Move entries between collections</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Container fluid className="my-4">
                    <CollectionEntriesMoveForm collectionId={collectionId} onClose={onClose} />
                </Container>
            </IonContent>
        </IonModal>
    );
};

export default CollectionEntriesMoveModal;
