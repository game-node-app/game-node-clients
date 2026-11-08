import { getTabAwareHref } from "@/util/getTabAwareHref";
import { IonItem, IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import { Group } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useSupporterStatus } from "@repo/ui";
import { IconHeart } from "@tabler/icons-react";

const PreferencesSupporterItems = () => {
  const { t } = useTranslation();
  // A failed/loading/disabled status query must never block Preferences: with
  // no confirmed supporter data we fall back to the support prompt.
  const { data } = useSupporterStatus();
  const statusLabel = data?.isSupporter
    ? t("supporter.preferences.supporterStatus")
    : t("supporter.preferences.freeStatus");

  return (
    <IonItemGroup>
      <IonItemDivider>
        <IonLabel>{t("supporter.preferences.title")}</IonLabel>
      </IonItemDivider>
      <IonItem button routerLink={getTabAwareHref("/preferences/supporter")}>
        <Group className={"gap-2"}>
          <IconHeart />
          <IonLabel>
            <h3>{t("supporter.preferences.title")}</h3>
            <p>{statusLabel}</p>
          </IonLabel>
        </Group>
      </IonItem>
    </IonItemGroup>
  );
};

export default PreferencesSupporterItems;
