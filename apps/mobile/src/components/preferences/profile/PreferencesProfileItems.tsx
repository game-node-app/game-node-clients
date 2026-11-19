import {
  CardRow,
  CardSection,
} from "@/components/general/card";
import { IonSelect, IonSelectOption } from "@ionic/react";
import { useDisclosure } from "@mantine/hooks";
import {
  SupportedLanguage,
  useI18nContext,
  useTranslation,
} from "@repo/locales";
import { LANGUAGE_OPTIONS, Modal, ProfileEditForm, useUserId } from "@repo/ui";
import { IconLanguage, IconUser } from "@tabler/icons-react";

const PreferencesProfileItems = () => {
  const { t } = useTranslation();
  const userId = useUserId();
  // Must go through the provider: a separate preference hook instance never reaches it.
  const { language, setLanguage } = useI18nContext();

  const [editModalOpened, editModalUtils] = useDisclosure();

  if (!userId) return null;

  return (
    <CardSection title={t("mobile.preferences.profile")}>
      <CardRow
        icon={<IconUser size={20} />}
        title={t("mobile.preferences.editProfileDetails")}
        onClick={editModalUtils.open}
      >
        <Modal
          title={t("mobile.preferences.editProfile")}
          opened={editModalOpened}
          onClose={editModalUtils.close}
        >
          <ProfileEditForm userId={userId} />
        </Modal>
      </CardRow>
      <CardRow
        icon={<IconLanguage size={20} />}
        title={t("mobile.preferences.setAppLanguage")}
        trailing={
          <IonSelect
            aria-label={t("mobile.preferences.setAppLanguage")}
            interface="popover"
            className="w-auto min-h-0 max-w-[55%] shrink-0 text-sm"
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
        }
      />
    </CardSection>
  );
};

export default PreferencesProfileItems;
