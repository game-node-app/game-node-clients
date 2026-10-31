import { IonItem, IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import { Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { IconRefreshDot } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

const PreferencesMiscItems = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return (
    <IonItemGroup>
      <IonItemDivider>
        <IonLabel>{t("mobile.preferences.misc")}</IonLabel>
      </IonItemDivider>
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