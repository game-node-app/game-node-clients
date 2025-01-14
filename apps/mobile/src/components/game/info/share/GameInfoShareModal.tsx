import React from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import { Container } from "@mantine/core";
import GameInfoShare from "@/components/game/info/share/GameInfoShare";

interface Props extends BaseModalProps {
    gameId: number;
}

const GameInfoShareModal = ({ gameId, opened, onClose }: Props) => {
    return (
        <IonModal isOpen={opened} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Share your review</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Container className={"my-4"}>
                    <GameInfoShare gameId={gameId} />
                </Container>
            </IonContent>
        </IonModal>
    );
};

export default GameInfoShareModal;
