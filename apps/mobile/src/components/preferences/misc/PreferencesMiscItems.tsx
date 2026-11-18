import { Capacitor } from "@capacitor/core";
import {
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import {
  useWidgetPeriod,
  WIDGET_PERIODS,
} from "@/components/wrapped/useWidgetPeriod";
import type { RecapPeriod } from "@repo/ui";
import { Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { IconRefreshDot } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

const PreferencesMiscItems = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [widgetPeriod, setWidgetPeriod] = useWidgetPeriod();

  return (
    <IonItemGroup>
      <IonItemDivider>
        <IonLabel>{t("mobile.preferences.misc")}</IonLabel>
      </IonItemDivider>
      {Capacitor.getPlatform() === "android" && (
        <IonItem>
          <IonSelect
            label={t("mobile.preferences.widgetPeriod")}
            interface="popover"
            value={widgetPeriod}
            onIonChange={(e) => setWidgetPeriod(e.detail.value as RecapPeriod)}
          >
            {WIDGET_PERIODS.map((period) => (
              <IonSelectOption key={period} value={period}>
                {t(`mobile.preferences.widgetPeriodOptions.${period}`)}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      )}
      <IonItem button>
        <Group
          className={"gap-2"}
          onClick={() => {
            queryClient.clear();
            notifications.show({
              color: "green",
              message: t("mobile.preferences.cacheClearedSuccess"),
            });
          }}
        >
          <IconRefreshDot />
          <IonLabel>{t("mobile.preferences.clearLocalCache")}</IonLabel>
        </Group>
      </IonItem>
    </IonItemGroup>
  );
};

export { PreferencesMiscItems };