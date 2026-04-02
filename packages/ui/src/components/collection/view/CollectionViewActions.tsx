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
import { useTranslation } from "@repo/locales";

interface Props {
  collectionId: string;
}

const CollectionViewActions = ({ collectionId }: Props) => {
  const { t } = useTranslation();
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
        <ActionChip icon={<IconAdjustments size={16} />}>
          {t("actions.edit")}
        </ActionChip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconDots size={16} />}
          onClick={createUpdateModalUtils.open}
        >
          {t("collection.actions.updateDetails")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconReorder size={16} />}
          onClick={reorderModalUtils.open}
        >
          {t("collection.actions.reorderGames")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconReplace size={16} />}
          onClick={moveModalUtils.open}
        >
          {t("collection.actions.moveGames")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>{t("preferences.labels.dangerZone")}</Menu.Label>
        <Menu.Item
          color={"red"}
          leftSection={<IconTrash size={16} />}
          onClick={removeModalUtils.open}
        >
          {t("collection.remove")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export { CollectionViewActions };
