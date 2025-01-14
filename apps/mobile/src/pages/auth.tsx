import React, { useEffect, useState } from "react";
import { Stack, Text } from "@mantine/core";
import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { AuthPage, canHandleRoute, getRoutingComponent } from "supertokens-auth-react/ui";
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
import { Box } from "@mantine/core";

const SupertokensAuthPage = () => {
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
                    <AuthPage preBuiltUIList={[ThirdPartyPreBuiltUI, PasswordlessPreBuiltUI]} />
                </Box>
            </IonContent>
        </IonPage>
    );
};

export default SupertokensAuthPage;
