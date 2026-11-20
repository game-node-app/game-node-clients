import { CardRow } from "@/components/general/card";
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
    <>
      <CardRow
        icon={<IconColorSwatch size={20} />}
        title={t("settings.appearance.theme.title")}
        onClick={() => openSettings("appearance", "theme")}
      />
      <CardRow
        icon={<IconPalette size={20} />}
        title={t("settings.appearance.customCovers.title")}
        onClick={open}
      >
        <Modal
          opened={opened}
          onClose={close}
          title={t("settings.appearance.customCovers.title")}
        >
          <SettingsCustomCoversSection showHeader={false} />
        </Modal>
      </CardRow>
    </>
  );
};

export default PreferencesAppearanceItems;
