import React from "react";
import { IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import PreferencesConnectionItem from "@/components/preferences/connections/PreferencesConnectionItem";
import { UserConnectionDto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";

const PreferencesConnectionsItems = () => {
  const { t } = useTranslation();

  return (
    <IonItemGroup>
      <IonItemDivider>
        <IonLabel>{t("preferences.categories.connections")}</IonLabel>
      </IonItemDivider>
      <PreferencesConnectionItem type={UserConnectionDto.type.STEAM} />
      <PreferencesConnectionItem type={UserConnectionDto.type.PSN} />
      <PreferencesConnectionItem type={UserConnectionDto.type.XBOX} />
    </IonItemGroup>
  );
};

export default PreferencesConnectionsItems;
