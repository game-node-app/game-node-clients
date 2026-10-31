import PreferencesConnectionItem from "@/components/preferences/connections/PreferencesConnectionItem";
import { IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import { useTranslation } from "@repo/locales";
import { UserConnectionDto } from "@repo/wrapper/server";

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