import React from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import ReportCreateForm, { ReportCreateFormProps } from "@/components/report/form/ReportCreateForm";
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import { Container } from "@mantine/core";

type Props = BaseModalProps & ReportCreateFormProps;

const ReportCreateFormModal = ({ opened, onClose, sourceType, sourceId }: Props) => {
    return (
        <IonModal isOpen={opened} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Report content</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Container fluid className={"my-4"}>
                    <ReportCreateForm sourceId={sourceId} sourceType={sourceType} onSuccess={onClose} />
                </Container>
            </IonContent>
        </IonModal>
    );
};

export default ReportCreateFormModal;
