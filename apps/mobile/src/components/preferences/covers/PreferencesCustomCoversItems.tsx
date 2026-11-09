import { IonItem, IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import { Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { Modal, SettingsCustomCoversSection } from "@repo/ui";
import { IconPalette } from "@tabler/icons-react";

/**
 * Custom cover display mode entry for the mobile Preferences page. The
 * setting itself is the shared appearance section, rendered in a modal.
 */
const PreferencesCustomCoversItems = () => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure();

  return (
    <IonItemGroup>
      <Modal
        opened={opened}
        onClose={close}
        title={t("settings.appearance.customCovers.title")}
      >
        <SettingsCustomCoversSection showHeader={false} />
      </Modal>
      <IonItemDivider>
        <IonLabel>{t("settings.tabs.appearance.label")}</IonLabel>
      </IonItemDivider>
      <IonItem button onClick={open}>
        <Group className={"gap-2"}>
          <IconPalette />
          <IonLabel>{t("settings.appearance.customCovers.title")}</IonLabel>
        </Group>
      </IonItem>
    </IonItemGroup>
  );
};

export default PreferencesCustomCoversItems;
