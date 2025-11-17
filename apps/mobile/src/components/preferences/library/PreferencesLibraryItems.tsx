import React from "react";
import { IonItem, IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import { Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PreferredPlatformsViewModal } from "@repo/ui";
import { IconBrandAppleArcade } from "@tabler/icons-react";

const PreferencesLibraryItems = () => {
  const [preferredPlatformsOpened, preferredPlatformsUtils] = useDisclosure();
  return (
    <IonItemGroup>
      <PreferredPlatformsViewModal
        opened={preferredPlatformsOpened}
        onClose={preferredPlatformsUtils.close}
      />
      <IonItemDivider>
        <IonLabel>Library</IonLabel>
      </IonItemDivider>
      <IonItem button onClick={preferredPlatformsUtils.open}>
        <Group className={"gap-2"}>
          <IconBrandAppleArcade />
          <IonLabel>Preferred Platforms</IonLabel>
        </Group>
      </IonItem>
    </IonItemGroup>
  );
};

export default PreferencesLibraryItems;
