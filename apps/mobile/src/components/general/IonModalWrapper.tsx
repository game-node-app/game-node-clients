import { ModalComponentProps } from "@repo/ui";
import React from "react";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Container } from "@mantine/core";

const IonModalWrapper = ({
  opened,
  onClose,
  title,
  breakpoints,
  initialBreakpoint,
  children,
}: ModalComponentProps) => {
  return (
    <IonModal
      isOpen={opened}
      onDidDismiss={onClose}
      breakpoints={breakpoints}
      initialBreakpoint={initialBreakpoint}
    >
      <IonHeader>
        <IonToolbar>
          {title && <IonTitle>{title}</IonTitle>}
          <IonButtons slot="end">
            <IonButton onClick={() => onClose()}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Container fluid className={"my-4"}>
          {children}
        </Container>
      </IonContent>
    </IonModal>
  );
};

export { IonModalWrapper };
