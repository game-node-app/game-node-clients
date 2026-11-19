import {
  CardRow,
  CardSection,
} from "@/components/general/card";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { useTranslation } from "@repo/locales";
import { useSupporterStatus } from "@repo/ui";
import { IconHeartFilled } from "@tabler/icons-react";

const PreferencesSupporterItems = () => {
  const { t } = useTranslation();
  // A failed/loading/disabled status query must never block Preferences: with
  // no confirmed supporter data we fall back to the support prompt.
  const { data } = useSupporterStatus();
  const statusLabel = data?.isSupporter
    ? t("supporter.preferences.supporterStatus")
    : t("supporter.preferences.freeStatus");

  return (
    <CardSection accent>
      <CardRow
        accent
        icon={<IconHeartFilled size={20} />}
        title={t("supporter.preferences.title")}
        description={statusLabel}
        href={getTabAwareHref("/preferences/supporter")}
      />
    </CardSection>
  );
};

export default PreferencesSupporterItems;
