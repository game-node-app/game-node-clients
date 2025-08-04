import React from "react";
import { UserConnectionDto } from "@repo/wrapper/server";
import { useDisclosure } from "@mantine/hooks";
import { ActionIcon, Group, Image } from "@mantine/core";
import { IonItem, IonLabel, IonToggle } from "@ionic/react";
import {
  ConnectionSyncView,
  getConnectionName,
  getServerStoredIcon,
  Modal,
  PreferencesConnectionModal,
  useOwnUserConnectionByType,
} from "@repo/ui";
import type = UserConnectionDto.type;
import { IconRefresh } from "@tabler/icons-react";

interface Props {
  type: type;
}

const PreferencesConnectionItem = ({ type }: Props) => {
  const userConnection = useOwnUserConnectionByType(type);
  const [modalOpened, modalUtils] = useDisclosure();
  const [syncModalOpened, syncModalUtils] = useDisclosure();

  return (
    <IonItem className={"relative"}>
      <Modal
        title={"Sync"}
        opened={syncModalOpened}
        onClose={syncModalUtils.close}
        keepMounted={false}
      >
        <ConnectionSyncView type={type} />
      </Modal>
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
      <Group className={"ms-auto"}>
        {userConnection.data != undefined && (
          <ActionIcon variant={"transparent"} onClick={syncModalUtils.open}>
            <IconRefresh />
          </ActionIcon>
        )}
        <IonToggle
          checked={userConnection.data != undefined}
          onClick={modalUtils.open}
        ></IonToggle>
      </Group>
    </IonItem>
  );
};

export default PreferencesConnectionItem;
