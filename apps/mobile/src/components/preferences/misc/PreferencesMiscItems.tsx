import { Capacitor } from "@capacitor/core";
import { IonSelect, IonSelectOption } from "@ionic/react";
import {
  CardRow,
  CardSection,
} from "@/components/general/card";
import {
  useWidgetPeriod,
  WIDGET_PERIODS,
} from "@/components/wrapped/useWidgetPeriod";
import type { RecapPeriod } from "@repo/ui";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { IconCalendarStats, IconRefreshDot } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

const PreferencesMiscItems = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [widgetPeriod, setWidgetPeriod] = useWidgetPeriod();

  return (
    <CardSection title={t("mobile.preferences.misc")}>
      {Capacitor.getPlatform() === "android" && (
        <CardRow
          icon={<IconCalendarStats size={20} />}
          title={t("mobile.preferences.widgetPeriod")}
          trailing={
            <IonSelect
              aria-label={t("mobile.preferences.widgetPeriod")}
              interface="popover"
              className="w-auto min-h-0 max-w-[55%] shrink-0 text-sm"
              value={widgetPeriod}
              onIonChange={(e) =>
                setWidgetPeriod(e.detail.value as RecapPeriod)
              }
            >
              {WIDGET_PERIODS.map((period) => (
                <IonSelectOption key={period} value={period}>
                  {t(`mobile.preferences.widgetPeriodOptions.${period}`)}
                </IonSelectOption>
              ))}
            </IonSelect>
          }
        />
      )}
      <CardRow
        icon={<IconRefreshDot size={20} />}
        title={t("mobile.preferences.clearLocalCache")}
        chevron={false}
        onClick={() => {
          queryClient.clear();
          notifications.show({
            color: "green",
            message: t("mobile.preferences.cacheClearedSuccess"),
          });
        }}
      />
    </CardSection>
  );
};

export { PreferencesMiscItems };
