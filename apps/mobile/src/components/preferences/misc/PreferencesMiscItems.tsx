import { Capacitor } from "@capacitor/core";
import { IonSelect, IonSelectOption } from "@ionic/react";
import { CardRow } from "@/components/general/card";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import {
  useWidgetPeriod,
  WIDGET_PERIODS,
} from "@/components/wrapped/useWidgetPeriod";
import type { RecapPeriod } from "@repo/ui";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import {
  IconCalendarStats,
  IconPlugConnected,
  IconRefreshDot,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

/** "Apps & tools" rows: GameNode + AI (MCP), the Android widget period and the local cache. */
const PreferencesMiscItems = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [widgetPeriod, setWidgetPeriod] = useWidgetPeriod();

  return (
    <>
      <CardRow
        icon={<IconPlugConnected size={20} />}
        title={t("mcp.title")}
        href={getTabAwareHref("/mcp")}
      />
      {Capacitor.getPlatform() === "android" && (
        <CardRow
          icon={<IconCalendarStats size={20} />}
          title={t("mobile.preferences.widgetPeriod")}
          trailing={
            <IonSelect
              aria-label={t("mobile.preferences.widgetPeriod")}
              interface="popover"
              className="w-auto min-h-11 max-w-[55%] shrink-0 text-sm"
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
    </>
  );
};

export { PreferencesMiscItems };
