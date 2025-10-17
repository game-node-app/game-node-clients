import React from "react";
import { Menu } from "@mantine/core";
import {
  IconAdjustments,
  IconDots,
  IconReorder,
  IconReplace,
  IconTrash,
} from "@tabler/icons-react";
import {
  CollectionCreateOrUpdateModal,
  CollectionEntriesMoveModal,
  CollectionOrderingUpdateForm,
  CollectionOrderingUpdateModal,
  CollectionRemoveModal,
} from "#@/components";
import { useDisclosure } from "@mantine/hooks";
import { ActionChip } from "#@/components/general/input/ActionChip.tsx";
import { Modal } from "#@/util";

interface Props {
  collectionId: string;
  onReorderButtonClick: () => void;
}

const CollectionViewActions = ({
  collectionId,
  onReorderButtonClick,
}: Props) => {
  const [createUpdateModalOpened, createUpdateModalUtils] = useDisclosure();
  const [moveModalOpened, moveModalUtils] = useDisclosure();
  const [removeModalOpened, removeModalUtils] = useDisclosure();
  const [reorderModalOpened, reorderModalUtils] = useDisclosure();

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
      <CollectionOrderingUpdateModal
        collectionId={collectionId}
        opened={reorderModalOpened}
        onClose={reorderModalUtils.close}
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
          leftSection={<IconReorder size={16} />}
          onClick={reorderModalUtils.open}
        >
          Reorder games
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

export { CollectionViewActions };
