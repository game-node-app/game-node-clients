import React from "react";
import { IonItem, IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { Group } from "@mantine/core";
import { IconDeviceGamepad2 } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";

const PreferencesImporterItems = () => {
  const { t } = useTranslation();

  return (
    <IonItemGroup>
      <IonItemDivider>
        <IonLabel>{t("mobile.preferences.importerSystem")}</IonLabel>
      </IonItemDivider>

      <IonItem button routerLink={getTabAwareHref("/importer")}>
        <Group className={"gap-2"}>
          <IconDeviceGamepad2 />
          <IonLabel>{t("library.buttons.importGames")}</IonLabel>
        </Group>
      </IonItem>
    </IonItemGroup>
  );
};

export default PreferencesImporterItems;
