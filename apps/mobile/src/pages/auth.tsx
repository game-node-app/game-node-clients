import React from "react";
import { Box } from "@mantine/core";
import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { AuthPage } from "supertokens-auth-react/ui";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";

const SupertokensAuthPage = () => {
  const router = useIonRouter();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          <IonTitle>Sign in</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Box className={"w-full h-full mt-20"}>
          <AuthPage
            preBuiltUIList={[ThirdPartyPreBuiltUI, PasswordlessPreBuiltUI]}
            navigate={{
              push: router.push,
              goBack: router.goBack,
            }}
          />
        </Box>
      </IonContent>
    </IonPage>
  );
};

export default SupertokensAuthPage;
