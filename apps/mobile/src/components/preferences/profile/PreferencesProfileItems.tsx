import { useUserId } from "@repo/ui";
import {
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonSelect,
  IonSelectOption,
  useIonRouter,
} from "@ionic/react";
import { Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  SupportedLanguage,
  useI18nContext,
  useTranslation,
} from "@repo/locales";
import { LANGUAGE_OPTIONS, Modal, ProfileEditForm } from "@repo/ui";
import { IconLanguage, IconUser } from "@tabler/icons-react";

const PreferencesProfileItems = () => {
  const { t } = useTranslation();
  const userId = useUserId();
  useIonRouter();
  // Must go through the provider: a separate preference hook instance never reaches it.
  const { language, setLanguage } = useI18nContext();

  const [editModalOpened, editModalUtils] = useDisclosure();

  if (!userId) return null;

  return (
    <IonItemGroup>
      <Modal
        title={t("mobile.preferences.editProfile")}
        opened={editModalOpened}
        onClose={editModalUtils.close}
      >
        <ProfileEditForm userId={userId} />
      </Modal>
      <IonItemDivider>
        <IonLabel>{t("mobile.preferences.profile")}</IonLabel>
      </IonItemDivider>
      <IonItem button onClick={editModalUtils.open}>
        <Group className={"gap-2"}>
          <IconUser />
          <IonLabel>{t("mobile.preferences.editProfileDetails")}</IonLabel>
        </Group>
      </IonItem>
      <IonItem button>
        <Group className={"gap-2"}>
          <IconLanguage />
          <IonSelect
            label={t("mobile.preferences.setAppLanguage")}
            value={language}
            onIonChange={(evt) => {
              setLanguage(evt.detail.value as SupportedLanguage);
            }}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <IonSelectOption key={option.value} value={option.value}>
                {option.label}
              </IonSelectOption>
            ))}
          </IonSelect>
        </Group>
      </IonItem>
    </IonItemGroup>
  );
};

export default PreferencesProfileItems;
