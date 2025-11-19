import React from "react";
import { IonItem, IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import { IconRefreshDot } from "@tabler/icons-react";
import { Group } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

const PreferencesMiscItems = () => {
  const queryClient = useQueryClient();

  return (
    <IonItemGroup>
      <IonItemDivider>
        <IonLabel>Misc</IonLabel>
      </IonItemDivider>
      <IonItem button>
        <Group
          className={"gap-2"}
          onClick={() => {
            queryClient.clear();
            notifications.show({
              color: "green",
              message: "Cache cleared successfully!",
            });
          }}
        >
          <IconRefreshDot />
          <IonLabel>Clear local cache</IonLabel>
        </Group>
      </IonItem>
    </IonItemGroup>
  );
};

export { PreferencesMiscItems };
