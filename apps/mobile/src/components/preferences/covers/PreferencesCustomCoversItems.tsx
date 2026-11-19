import { CardRow } from "@/components/general/card";
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
  );
};

export default PreferencesCustomCoversItems;
