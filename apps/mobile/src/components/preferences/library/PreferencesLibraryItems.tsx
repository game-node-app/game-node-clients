import { CardRow } from "@/components/general/card";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { PreferredPlatformsViewModal } from "@repo/ui";
import { IconBrandAppleArcade } from "@tabler/icons-react";

const PreferencesLibraryItems = () => {
  const { t } = useTranslation();
  const [preferredPlatformsOpened, preferredPlatformsUtils] = useDisclosure();
  return (
    <CardRow
      icon={<IconBrandAppleArcade size={20} />}
      title={t("preferences.labels.preferredPlatforms")}
      onClick={preferredPlatformsUtils.open}
    >
      <PreferredPlatformsViewModal
        opened={preferredPlatformsOpened}
        onClose={preferredPlatformsUtils.close}
      />
    </CardRow>
  );
};

export default PreferencesLibraryItems;
