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

/**
 * Renders an *optionally* draggable list of preferred platforms.
 * @constructor
 */
const PreferredPlatformsView = () => {
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
      {isLoading && <CenteredLoading message={"Loading platforms..."} />}
      {preferredPlatforms?.length === 0 && (
        <Stack>
          <Text className={"text-dimmed"}>No preferred platform added.</Text>
        </Stack>
      )}
      <Text className={"text-sm text-dimmed"}>
        These platforms will be used to automatically when adding new games that
        support these platforms.
      </Text>
      {preferredPlatforms?.map((item) => (
        <PreferredPlatformItem key={item.id} item={item} />
      ))}
    </Stack>
  );
};

export { PreferredPlatformsView };
