import React from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import { UserConnectionDto } from "@/wrapper/server";
import { Container } from "@mantine/core";
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import PreferencesConnectionSetup from "@/components/preferences/connections/PreferencesConnectionSetup";
import { getCapitalizedText } from "@/util/getCapitalizedText";

interface Props extends BaseModalProps {
    type: UserConnectionDto.type;
}

const PreferencesConnectionModal = ({ opened, onClose, type }: Props) => {
    return (
        <IonModal isOpen={opened} onDidDismiss={onClose} initialBreakpoint={0.5} breakpoints={[0.5, 0.75, 1]}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Set up your {getCapitalizedText(type)} connection</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Container fluid className={"my-4"}>
                    <PreferencesConnectionSetup type={type} onClose={onClose} />
                </Container>
            </IonContent>
        </IonModal>
    );
};

export default PreferencesConnectionModal;
