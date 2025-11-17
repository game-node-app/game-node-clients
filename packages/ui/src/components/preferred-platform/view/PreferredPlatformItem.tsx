import {
  EditPreferredPlatformModal,
  usePreferredPlatforms,
} from "#@/components";
import { getServerStoredIcon, sleep } from "#@/util";
import {
  ActionIcon,
  Flex,
  Group,
  Image,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  PreferredPlatformDto,
  PreferredPlatformService,
} from "@repo/wrapper/server";
import { IconEdit } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

interface Props {
  item: PreferredPlatformDto;
}

const PreferredPlatformItem = ({ item }: Props) => {
  const platform = item.platform;
  const { invalidate, queryKey } = usePreferredPlatforms();
  const [modalOpened, modalOpenedUtils] = useDisclosure();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: async (newStatus: boolean) => {
      await PreferredPlatformService.preferredPlatformControllerCreateOrUpdateV1(
        {
          platformId: platform.id,
          label: item.label,
          isEnabled: newStatus,
        },
      );
    },
    onMutate: async () => {
      const previousItems =
        queryClient.getQueryData<PreferredPlatformDto[]>(queryKey);

      queryClient.setQueryData(queryKey, (oldData?: PreferredPlatformDto[]) => {
        const targetIndex = oldData?.findIndex((pp) => pp.id === item.id);
        if (targetIndex === undefined || targetIndex < 0) {
          return oldData;
        }
        const newData = [...(oldData || [])];
        newData[targetIndex] = {
          ...newData[targetIndex],
          enabled: !newData[targetIndex].enabled,
        };
        console.log(
          "Optimistically updated preferred platform:",
          newData[targetIndex],
        );
        console.log(newData);
        return newData;
      });

      return {
        previousItems,
      };
    },
    onError: (_err, _newStatus, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems);
      }
    },
    onSettled: async () => {
      invalidate();
    },
  });

  return (
    <Flex className={"rounded-md p-4 bg-paper-2"}>
      <EditPreferredPlatformModal
        opened={modalOpened}
        onClose={modalOpenedUtils.close}
        platformId={platform.id}
      />
      <Group>
        {item.iconName && (
          <Image
            className={"h-12 w-12 object-contain"}
            src={getServerStoredIcon(item.iconName)}
          />
        )}
        <Stack className={"gap-1"}>
          <Text className={"font-bold"}>{platform.name}</Text>
          <Text className={"text-sm text-dimmed"}>{platform.abbreviation}</Text>
        </Stack>
      </Group>
      <Group className={"ms-auto"}>
        <ActionIcon variant={"default"} onClick={modalOpenedUtils.open}>
          <IconEdit size={20} />
        </ActionIcon>
        <Switch
          checked={item.enabled}
          onChange={() => {
            statusMutation.mutate(!item.enabled);
          }}
        />
      </Group>
    </Flex>
  );
};

export { PreferredPlatformItem };
