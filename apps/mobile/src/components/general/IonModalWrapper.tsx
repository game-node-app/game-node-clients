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
  onBreakpointChange,
  withCloseButton = true,
  classNames,
  children,
}: ModalComponentProps) => {
  return (
    <IonModal
      isOpen={opened}
      onDidDismiss={() => {
        onClose();
      }}
      breakpoints={breakpoints}
      initialBreakpoint={initialBreakpoint}
      onIonBreakpointDidChange={(evt) => {
        if (onBreakpointChange) {
          onBreakpointChange(evt.detail.breakpoint);
        }
      }}
    >
      <IonHeader>
        <IonToolbar>
          {title && <IonTitle>{title}</IonTitle>}
          {withCloseButton && (
            <IonButtons slot="end">
              <IonButton
                onClick={() => {
                  onClose();
                }}
              >
                Close
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Container
          className={`w-full ion-padding ${classNames?.body ? classNames.body : ""}`}
        >
          {children}
        </Container>
      </IonContent>
    </IonModal>
  );
};

export { IonModalWrapper };
