import { IonItem, IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import { Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import {
  Modal,
  SettingsCustomCoversSection,
  useSettingsModalState,
} from "@repo/ui";
import { IconColorSwatch, IconPalette } from "@tabler/icons-react";

/**
 * Appearance entries for mobile Preferences. Theme and cover settings are
 * rendered through the shared settings components.
 */
const PreferencesAppearanceItems = () => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure();
  const { open: openSettings } = useSettingsModalState();

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
      <IonItem button onClick={() => openSettings("appearance", "theme")}>
        <Group className={"gap-2"}>
          <IconColorSwatch />
          <IonLabel>{t("settings.appearance.theme.title")}</IonLabel>
        </Group>
      </IonItem>
      <IonItem button onClick={open}>
        <Group className={"gap-2"}>
          <IconPalette />
          <IonLabel>{t("settings.appearance.customCovers.title")}</IonLabel>
        </Group>
      </IonItem>
    </IonItemGroup>
  );
};

export default PreferencesAppearanceItems;
