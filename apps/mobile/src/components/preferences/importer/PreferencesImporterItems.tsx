import {
  CardRow,
  CardSection,
} from "@/components/general/card";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { useTranslation } from "@repo/locales";
import { IconDeviceGamepad2 } from "@tabler/icons-react";

const PreferencesImporterItems = () => {
  const { t } = useTranslation();

  return (
    <CardSection title={t("mobile.preferences.importerSystem")}>
      <CardRow
        icon={<IconDeviceGamepad2 size={20} />}
        title={t("library.buttons.importGames")}
        href={getTabAwareHref("/importer")}
      />
    </CardSection>
  );
};

export default PreferencesImporterItems;
