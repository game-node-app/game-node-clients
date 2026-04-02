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
import useUserId from "@/components/auth/hooks/useUserId";
import { IconLogout2, IconUser } from "@tabler/icons-react";
import { signOut } from "supertokens-website";
import { ProfileEditForm } from "@repo/ui";
import { useTranslation } from "@repo/locales";

const PreferencesProfileItems = () => {
  const { t } = useTranslation();
  const userId = useUserId();
  const router = useIonRouter();

  const [editModalOpened, editModalUtils] = useDisclosure();

  if (!userId) return null;

  return (
    <IonItemGroup>
      <IonModal isOpen={editModalOpened} onDidDismiss={editModalUtils.close}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{t("mobile.preferences.editProfile")}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={editModalUtils.close}>
                {t("actions.cancel")}
              </IonButton>
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
        <IonLabel>{t("mobile.preferences.profile")}</IonLabel>
      </IonItemDivider>

      <IonItem button onClick={editModalUtils.open}>
        <Group className={"gap-2"}>
          <IconUser />
          <IonLabel>{t("mobile.preferences.editProfileDetails")}</IonLabel>
        </Group>
      </IonItem>
    </IonItemGroup>
  );
};

export default PreferencesProfileItems;
