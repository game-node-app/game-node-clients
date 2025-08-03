import React from "react";
import { UserConnectionDto } from "../../../../../../wrapper/src/server";
import { useOwnUserConnectionByType } from "#@/components/connections/hooks/useOwnUserConnectionByType";
import { useDisclosure } from "@mantine/hooks";
import {
  ActionIcon,
  Group,
  Image,
  Paper,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import { PreferencesConnectionModal } from "#@/components/preferences/handlers/connections/PreferencesConnectionModal";
import { IconRefresh } from "@tabler/icons-react";
import { Modal } from "#@/util";
import { ConnectionSyncView } from "#@/components/connections/sync/ConnectionSyncView.tsx";
import type = UserConnectionDto.type;

interface Props {
  type: type;
}

const PreferencesConnectionItem = ({ type }: Props) => {
  const userConnection = useOwnUserConnectionByType(type);
  const [modalOpened, modalUtils] = useDisclosure();
  const [syncModalOpened, syncModalUtils] = useDisclosure();

  return (
    <Paper
      className={"rounded"}
      styles={{
        root: {
          backgroundColor: "#161616",
        },
      }}
    >
      <Modal
        title={"Sync"}
        opened={syncModalOpened}
        onClose={syncModalUtils.close}
        keepMounted={false}
      >
        <ConnectionSyncView type={type} />
      </Modal>
      <Group className={"w-full h-full min-h-28 p-2 px-4"}>
        <PreferencesConnectionModal
          type={type}
          opened={modalOpened}
          onClose={modalUtils.close}
        />
        <Image
          alt={"Connection icon"}
          src={getServerStoredIcon(type.valueOf())}
          w={38}
          h={38}
        />
        <Stack gap={3}>
          {userConnection.data ? (
            <>
              <Title size={"h5"}>{userConnection.data.sourceUsername}</Title>
              <Text c={"dimmed"}>Connected</Text>
            </>
          ) : (
            <>
              <Text>Not connected</Text>
            </>
          )}
        </Stack>
        <Group className={"ms-auto me-4"}>
          {userConnection.data != undefined && (
            <ActionIcon variant={"transparent"} onClick={syncModalUtils.open}>
              <IconRefresh />
            </ActionIcon>
          )}
          <Switch
            checked={userConnection.data != undefined}
            onChange={() => {
              modalUtils.open();
            }}
          />
        </Group>
      </Group>
    </Paper>
  );
};

export { PreferencesConnectionItem };
