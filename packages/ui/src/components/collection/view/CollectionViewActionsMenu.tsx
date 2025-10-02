import React from "react";
import { Menu } from "@mantine/core";
import {
  IconAdjustments,
  IconDots,
  IconReplace,
  IconTrash,
} from "@tabler/icons-react";
import {
  CollectionCreateOrUpdateModal,
  CollectionEntriesMoveModal,
  CollectionRemoveModal,
} from "#@/components";
import { useDisclosure } from "@mantine/hooks";
import { ActionChip } from "#@/components/general/input/ActionChip.tsx";

interface Props {
  collectionId: string;
}

const CollectionViewActionsMenu = ({ collectionId }: Props) => {
  const [createUpdateModalOpened, createUpdateModalUtils] = useDisclosure();
  const [moveModalOpened, moveModalUtils] = useDisclosure();
  const [removeModalOpened, removeModalUtils] = useDisclosure();

  return (
    <Menu>
      <CollectionCreateOrUpdateModal
        opened={createUpdateModalOpened}
        onClose={() => createUpdateModalUtils.close()}
        collectionId={collectionId}
      />
      <CollectionEntriesMoveModal
        collectionId={collectionId}
        opened={moveModalOpened}
        onClose={moveModalUtils.close}
      />
      <CollectionRemoveModal
        collectionId={collectionId}
        opened={removeModalOpened}
        onClose={removeModalUtils.close}
      />
      <Menu.Target refProp={"rootRef"}>
        <ActionChip icon={<IconAdjustments size={16} />}>Edit</ActionChip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconDots size={16} />}
          onClick={createUpdateModalUtils.open}
        >
          Update title and description
        </Menu.Item>
        <Menu.Item
          leftSection={<IconReplace size={16} />}
          onClick={moveModalUtils.open}
        >
          Move games to another collection
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>Danger Zone</Menu.Label>
        <Menu.Item
          color={"red"}
          leftSection={<IconTrash size={16} />}
          onClick={removeModalUtils.open}
        >
          Delete collection
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export { CollectionViewActionsMenu };
