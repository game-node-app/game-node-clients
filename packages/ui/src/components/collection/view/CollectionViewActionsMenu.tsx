import React from "react";
import { Menu } from "@mantine/core";
import {
  IconAdjustments,
  IconDots,
  IconDownload,
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
import { Link } from "#@/util";

interface Props {
  collectionId: string;
}

const CollectionViewActionsMenu = ({ collectionId }: Props) => {
  const [createUpdateModalOpened, createUpdateModalUtils] = useDisclosure();
  const [moveModalOpened, moveModalUtils] = useDisclosure();
  const [removeModalOpened, removeModalUtils] = useDisclosure();

  return (
    <Menu offset={16}>
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
      <Menu.Target>
        <ActionChip icon={<IconAdjustments size={"1rem"} />}>Edit</ActionChip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconDots size={"1rem"} />}
          onClick={createUpdateModalUtils.open}
        >
          Update title and description
        </Menu.Item>
        <Menu.Item
          leftSection={<IconReplace size={"1rem"} />}
          onClick={moveModalUtils.open}
        >
          Move games to another collection
        </Menu.Item>
        <Menu.Item leftSection={<IconDownload size={"1rem"} />}>
          <Link href={"/importer"}>Import games</Link>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>Danger Zone</Menu.Label>
        <Menu.Item
          color="red"
          leftSection={<IconTrash size={"1rem"} />}
          onClick={removeModalUtils.open}
        >
          Delete Collection
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export { CollectionViewActionsMenu };
