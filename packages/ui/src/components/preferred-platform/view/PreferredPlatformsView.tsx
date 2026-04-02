import {
  CenteredLoading,
  EditPreferredPlatformModal,
  PreferredPlatformItem,
  usePreferredPlatforms,
} from "#@/components";
import { ActionIcon, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import React from "react";
import { useTranslation } from "@repo/locales";

/**
 * Renders an *optionally* draggable list of preferred platforms.
 * @constructor
 */
const PreferredPlatformsView = () => {
  const { t } = useTranslation();
  const { data: preferredPlatforms, isLoading } = usePreferredPlatforms();
  const [editModalOpened, editModalUtils] = useDisclosure();

  return (
    <Stack>
      <EditPreferredPlatformModal
        opened={editModalOpened}
        onClose={editModalUtils.close}
      />
      <ActionIcon
        className={"ms-auto"}
        variant={"filled"}
        size={"md"}
        onClick={editModalUtils.open}
      >
        <IconPlus />
      </ActionIcon>
      {isLoading && (
        <CenteredLoading message={t("preferences.platforms.loading")} />
      )}
      {preferredPlatforms?.length === 0 && (
        <Stack>
          <Text className={"text-dimmed"}>
            {t("preferences.messages.noPlatforms")}
          </Text>
        </Stack>
      )}
      <Text className={"text-sm text-dimmed"}>
        {t("preferences.platforms.description")}
      </Text>
      {preferredPlatforms?.map((item) => (
        <PreferredPlatformItem key={item.id} item={item} />
      ))}
    </Stack>
  );
};

export { PreferredPlatformsView };
