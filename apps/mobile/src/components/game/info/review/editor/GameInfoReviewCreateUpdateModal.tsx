import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import React from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import { Container } from "@mantine/core";
import GameInfoReviewEditorView from "@/components/game/info/review/editor/GameInfoReviewEditorView";

interface Props extends BaseModalProps {
    gameId: number;
}

const GameInfoReviewCreateUpdateModal = ({ gameId, opened, onClose }: Props) => {
    return (
        <IonModal isOpen={opened} onDidDismiss={onClose} initialBreakpoint={0.9} breakpoints={[0.75, 0.9, 1]}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Your review</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Go back</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Container fluid className={"my-4"}>
                    <GameInfoReviewEditorView gameId={gameId} onClose={onClose} />
                </Container>
            </IonContent>
        </IonModal>
    );
};

export default GameInfoReviewCreateUpdateModal;
