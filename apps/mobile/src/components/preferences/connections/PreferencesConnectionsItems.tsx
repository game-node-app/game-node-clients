import React from "react";
import { IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import PreferencesConnectionItem from "@/components/preferences/connections/PreferencesConnectionItem";
import { UserConnectionDto } from "@repo/wrapper/server";

const PreferencesConnectionsItems = () => {
    return (
        <IonItemGroup>
            <IonItemDivider>
                <IonLabel>Connections</IonLabel>
            </IonItemDivider>
            <PreferencesConnectionItem type={UserConnectionDto.type.STEAM} />
            <PreferencesConnectionItem type={UserConnectionDto.type.PSN} />
        </IonItemGroup>
    );
};

export default PreferencesConnectionsItems;
