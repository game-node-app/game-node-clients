import React from "react";
import { PreferredPlatformDto } from "@repo/wrapper/server";
import {
  ActionIcon,
  Box,
  Flex,
  Group,
  Image,
  Stack,
  Text,
} from "@mantine/core";
import { cn, getServerStoredIcon } from "#@/util";
import {
  IconDragDrop,
  IconEdit,
  IconGripHorizontal,
} from "@tabler/icons-react";
import {
  EditPreferredPlatformForm,
  EditPreferredPlatformModal,
} from "#@/components";
import { useDisclosure } from "@mantine/hooks";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  item: PreferredPlatformDto;
  disabled?: boolean;
}

const PreferredPlatformItem = ({ item, disabled }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.platformId!, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const platform = item.platform;
  const [modalOpened, modalOpenedUtils] = useDisclosure();

  return (
    <Flex
      className={cn("rounded-md p-4 bg-paper-2", {
        "bg-paper-1 z-50": isDragging,
      })}
      style={style}
      ref={setNodeRef}
      {...attributes}
    >
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
        <IconGripHorizontal
          size={28}
          className={cn("cursor-grab", {
            "text-brand-4 cursor-grabbing": isDragging,
            "text-dimmed": disabled,
          })}
          {...listeners}
        />
      </Group>
    </Flex>
  );
};

export { PreferredPlatformItem };
