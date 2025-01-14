import React, { useEffect, useState } from "react";
import { Container } from "@mantine/core";
import CollectionEntryAddOrUpdateForm from "@/components/collection/collection-entry/form/CollectionEntryAddOrUpdateForm";
import { BaseModalProps } from "@/util/types/modal-props";
import { useUserLibrary } from "@/components/library/hooks/useUserLibrary";
import useUserId from "@/components/auth/hooks/useUserId";
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import { useOwnCollectionEntryForGameId } from "../../hooks/useOwnCollectionEntryForGameId";

interface IGameAddModalProps extends BaseModalProps {
    id: number;
}

const CollectionEntryAddOrUpdateModal = ({ opened, onClose, id }: IGameAddModalProps) => {
    const userId = useUserId();
    const collectionEntryQuery = useOwnCollectionEntryForGameId(id, opened);
    const [isExpanded, setIsExpanded] = useState(false);

    const isInLibrary = collectionEntryQuery.data != undefined;

    return (
        <IonModal
            onIonBreakpointDidChange={(evt) => {
                setIsExpanded(evt.detail.breakpoint > 0.75);
            }}
            isOpen={opened}
            onDidDismiss={onClose}
            initialBreakpoint={0.75}
            breakpoints={[0, 0.25, 0.5, 0.75, 1]}
        >
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{isInLibrary ? "Edit in your library" : "Add to your library"}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className={""}>
                <Container fluid className={"my-4"}>
                    <CollectionEntryAddOrUpdateForm gameId={id} onClose={onClose} showGameInfo={isExpanded} />
                </Container>
            </IonContent>
        </IonModal>
    );
};

export default CollectionEntryAddOrUpdateModal;
