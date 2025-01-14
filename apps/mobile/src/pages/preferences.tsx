import React from "react";
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonItemDivider,
    IonItemGroup,
    IonLabel,
    IonList,
    IonPage,
    IonRouterLink,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { Container } from "@mantine/core";
import PreferencesConnectionsItems from "@/components/preferences/connections/PreferencesConnectionsItems";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { Link } from "react-router-dom";
import PreferencesProfileItems from "@/components/preferences/profile/PreferencesProfileItems";
import PreferencesImporterItems from "@/components/preferences/importer/PreferencesImporterItems";

const PreferencesPage = () => {
    return (
        <IonPage>
            <SessionAuth>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot={"start"}>
                            <IonBackButton />
                        </IonButtons>
                        <IonTitle>Preferences</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <Container fluid className={"mb-4 p-0"}>
                        <IonList className={"pt-0"}>
                            <PreferencesProfileItems />
                            <PreferencesConnectionsItems />
                            <PreferencesImporterItems />
                        </IonList>
                    </Container>
                </IonContent>
            </SessionAuth>
        </IonPage>
    );
};

export default PreferencesPage;
