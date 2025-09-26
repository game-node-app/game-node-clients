import React, { PropsWithChildren } from "react";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";

interface Props extends PropsWithChildren {
  withSearch?: boolean;
}

const AppPage = ({ withSearch, children }: Props) => {
  return (
    <IonPage>
      <IonHeader className={"ion-no-border"}>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton className={"p-0"} />
          </IonButtons>
          {withSearch && <IonButtons slot={"end"}></IonButtons>}
        </IonToolbar>
      </IonHeader>
      <ScrollableIonContent className={"ion-padding"}>
        {children}
      </ScrollableIonContent>
    </IonPage>
  );
};

export { AppPage };
