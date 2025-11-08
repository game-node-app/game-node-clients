import React, { useEffect, useEffectEvent, useState } from "react";
import { ActionIcon, Stack, Text } from "@mantine/core";
import {
  CenteredLoading,
  EditPreferredPlatformModal,
  PreferredPlatformItem,
  useOnMobile,
  usePreferredPlatforms,
} from "#@/components";
import {
  IconCheck,
  IconExclamationCircle,
  IconPlus,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  PreferredPlatformDto,
  PreferredPlatformService,
  UpdatePreferredPlatformOrderDto,
} from "@repo/wrapper/server";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { getErrorMessage, sleep } from "#@/util";

/**
 * Renders an *optionally* draggable list of preferred platforms.
 * @constructor
 */
const PreferredPlatformsView = () => {
  const onMobile = useOnMobile();
  const { data: preferredPlatforms, isLoading } = usePreferredPlatforms();
  const [internalPreferredPlatforms, setInternalPreferredPlatforms] = useState<
    PreferredPlatformDto[]
  >([]);
  const [editModalOpened, editModalUtils] = useDisclosure();

  const sensors = useSensors(
    useSensor(onMobile ? TouchSensor : PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const dragMutation = useMutation({
    mutationFn: async (dragResult: UpdatePreferredPlatformOrderDto) => {
      // Perform the mutation to update the preferred platform ordering
      // This is a placeholder; replace with actual API call
      console.log("Updating platform order with:", dragResult);
      await PreferredPlatformService.preferredPlatformControllerUpdateOrderV1(
        dragResult,
      );
    },
    onMutate: () => {
      return notifications.show({
        loading: true,
        message: "Applying changes...",
        autoClose: false,
        withCloseButton: false,
      });
    },
    onSuccess: (_data, _variables, notificationId) => {
      notifications.update({
        id: notificationId,
        color: "teal",
        title: "Changes applied!",
        message: "Your preferred platform ordering has been updated.",
        icon: <IconCheck size={18} />,
        loading: false,
        autoClose: 2000,
        withCloseButton: true,
      });
    },
    onError: (err, _variables, notificationId) => {
      notifications.update({
        id: notificationId,
        color: "red",
        title: "Failed to sync changes!",
        message: getErrorMessage(err),
        loading: false,
        autoClose: 10000,
        withCloseButton: true,
        icon: <IconExclamationCircle size={18} />,
      });
    },
  });

  const updateInternalState = useEffectEvent(() => {
    setInternalPreferredPlatforms(preferredPlatforms ?? []);
  });

  useEffect(() => {
    if (preferredPlatforms && preferredPlatforms.length !== 0) {
      updateInternalState();
    }
  }, [preferredPlatforms]);

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
        Drag and drop to reorder your preferred platforms. Platforms at the top
        will have preference in the Importer system.
      </Text>
      {preferredPlatforms != undefined && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(evt) => {
            const { active, over } = evt;
            if (active.id !== over?.id) {
              const oldIndex = internalPreferredPlatforms.findIndex(
                (item) => item.platformId === active.id,
              );
              const newIndex = internalPreferredPlatforms.findIndex(
                (item) => item.platformId === over?.id,
              );
              const updatedList = arrayMove(
                internalPreferredPlatforms,
                oldIndex,
                newIndex,
              );
              setInternalPreferredPlatforms(updatedList);

              const previousItem = updatedList[newIndex - 1];
              const nextItem = updatedList[newIndex + 1];
              const currentItem = updatedList[newIndex];
              const result: UpdatePreferredPlatformOrderDto = {
                previousPlatformId: previousItem
                  ? previousItem.platformId
                  : undefined,
                nextPlatformId: nextItem ? nextItem.platformId : undefined,
                targetPlatformId: currentItem.platformId,
              };

              dragMutation.mutate(result);
            }
          }}
        >
          <SortableContext
            items={internalPreferredPlatforms.map((item) => item.platformId)}
            strategy={verticalListSortingStrategy}
          >
            {internalPreferredPlatforms.map((item) => (
              <PreferredPlatformItem
                key={item.id}
                item={item}
                disabled={dragMutation.isPending}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </Stack>
  );
};

export { PreferredPlatformsView };
