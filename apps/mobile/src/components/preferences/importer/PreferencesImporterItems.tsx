import React from "react";
import { IonItem, IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { Group } from "@mantine/core";
import { IconDeviceGamepad2 } from "@tabler/icons-react";

const PreferencesImporterItems = () => {
    return (
        <IonItemGroup>
            <IonItemDivider>
                <IonLabel>Importer system</IonLabel>
            </IonItemDivider>

            <IonItem button routerLink={getTabAwareHref("/importer")}>
                <Group className={"gap-2"}>
                    <IconDeviceGamepad2 />
                    <IonLabel>Import games</IonLabel>
                </Group>
            </IonItem>
        </IonItemGroup>
    );
};

export default PreferencesImporterItems;
