import React from "react";
import { Button, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PreferencesRestartAccountModal } from "#@/components/preferences/handlers/account/PreferencesRestartAccountModal";
import { useTranslation } from "@repo/locales";

const PreferencesAccountScreen = () => {
  const { t } = useTranslation();
  const [restartModalOpened, restartModalUtils] = useDisclosure();

  return (
    <Stack>
      <Stack>
        <PreferencesRestartAccountModal
          opened={restartModalOpened}
          onClose={restartModalUtils.close}
        />
        <Text className={"ps-1 text-sm text-red-400"}>
          {t("preferences.labels.dangerZone")}
        </Text>
        <Button className={"w-40"} onClick={restartModalUtils.open}>
          {t("preferences.titles.restartAccount")}
        </Button>
      </Stack>
    </Stack>
  );
};

export { PreferencesAccountScreen };
