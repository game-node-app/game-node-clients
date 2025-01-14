import React from "react";
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonItemDivider,
    IonItemGroup,
    IonLabel,
    IonModal,
    IonTitle,
    IonToolbar,
    useIonRouter,
} from "@ionic/react";
import { useDisclosure } from "@mantine/hooks";
import { Container, Group } from "@mantine/core";
import ProfileEditForm from "@/components/profile/edit/ProfileEditForm";
import useUserId from "@/components/auth/hooks/useUserId";
import { IconLogout2, IconUser } from "@tabler/icons-react";
import { signOut } from "supertokens-website";

const PreferencesProfileItems = () => {
    const userId = useUserId();
    const router = useIonRouter();

    const [editModalOpened, editModalUtils] = useDisclosure();

    if (!userId) return null;

    return (
        <IonItemGroup>
            <IonModal isOpen={editModalOpened} onDidDismiss={editModalUtils.close}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Edit profile</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={editModalUtils.close}>Cancel</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <Container fluid className="my-4">
                        <ProfileEditForm userId={userId} />
                    </Container>
                </IonContent>
            </IonModal>
            <IonItemDivider>
                <IonLabel>Profile</IonLabel>
            </IonItemDivider>

            <IonItem button onClick={editModalUtils.open}>
                <Group className={"gap-2"}>
                    <IconUser />
                    <IonLabel>Edit profile details</IonLabel>
                </Group>
            </IonItem>
            <IonItem
                button
                onClick={() => {
                    signOut().then(() => {
                        router.push("/home");
                    });
                }}
            >
                <Group className={"gap-2"}>
                    <IconLogout2 />
                    <IonLabel>Sign out</IonLabel>
                </Group>
            </IonItem>
        </IonItemGroup>
    );
};

export default PreferencesProfileItems;
