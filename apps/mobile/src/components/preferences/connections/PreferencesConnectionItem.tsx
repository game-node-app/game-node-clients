import React from "react";
import { UserConnectionDto } from "@repo/wrapper/server";
import { useDisclosure } from "@mantine/hooks";
import { Group, Image } from "@mantine/core";
import { IonItem, IonLabel, IonToggle } from "@ionic/react";
import {
  getConnectionName,
  getServerStoredIcon,
  PreferencesConnectionModal,
  useOwnUserConnectionByType,
} from "@repo/ui";
import type = UserConnectionDto.type;

interface Props {
  type: type;
}

const PreferencesConnectionItem = ({ type }: Props) => {
  const userConnection = useOwnUserConnectionByType(type);
  const [modalOpened, modalUtils] = useDisclosure();

  return (
    <IonItem className={"relative"}>
      <PreferencesConnectionModal
        type={type}
        opened={modalOpened}
        onClose={modalUtils.close}
      />
      <Group className={"gap-2"}>
        <Image
          alt={"Connection icon"}
          src={getServerStoredIcon(type.valueOf())}
          w={28}
          h={28}
        />
        <IonLabel>{getConnectionName(type)}</IonLabel>
      </Group>
      <IonToggle
        slot={"end"}
        checked={userConnection.data != undefined}
        onClick={modalUtils.open}
      ></IonToggle>
    </IonItem>
  );
};

export default PreferencesConnectionItem;
