import React from "react";
import { Button, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PreferencesRestartAccountModal } from "#@/components/preferences/handlers/account/PreferencesRestartAccountModal";

const PreferencesAccountScreen = () => {
  const [restartModalOpened, restartModalUtils] = useDisclosure();

  return (
    <Stack>
      <Stack>
        <PreferencesRestartAccountModal
          opened={restartModalOpened}
          onClose={restartModalUtils.close}
        />
        <Text className={"ps-1 text-sm text-red-400"}>Danger Zone</Text>
        <Button className={"w-40"} onClick={restartModalUtils.open}>
          Restart Account
        </Button>
      </Stack>
    </Stack>
  );
};

export { PreferencesAccountScreen };
