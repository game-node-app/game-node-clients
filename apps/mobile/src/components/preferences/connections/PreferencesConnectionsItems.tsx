import PreferencesConnectionItem from "@/components/preferences/connections/PreferencesConnectionItem";
import { IonItem, IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import { useTranslation } from "@repo/locales";
import { UserConnectionDto } from "@repo/wrapper/server";

import { getTabAwareHref } from "@/util/getTabAwareHref";

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
      <IonItem routerLink={getTabAwareHref("/mcp")} button detail>
        <IonLabel>{t("mcp.title")}</IonLabel>
      </IonItem>
    </IonItemGroup>
  );
};

export default PreferencesConnectionsItems;
