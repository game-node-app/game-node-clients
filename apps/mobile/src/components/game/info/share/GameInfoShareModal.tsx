import React from "react";
import { BaseModalProps } from "@/util/types/modal-props";
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
import { GameInfoShare } from "@repo/ui";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { blobToBase64 } from "@/util/imageUtils.ts";

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
          <GameInfoShare
            gameId={gameId}
            onShare={async (file) => {
              const base64 = await blobToBase64(file);

              const cachedFileResult = await Filesystem.writeFile({
                path: file.name,
                data: base64,
                directory: Directory.Cache,
              });

              await Share.share({
                title: "My review of this game",
                dialogTitle: "Share your review with friends!",
                url: cachedFileResult.uri,
              });
            }}
          />
        </Container>
      </IonContent>
    </IonModal>
  );
};

export default GameInfoShareModal;
