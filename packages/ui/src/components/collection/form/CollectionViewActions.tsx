import React from "react";
import {
  ActionIcon,
  Group,
  GroupProps,
  SimpleGrid,
  Tooltip,
} from "@mantine/core";
import {
  IconDots,
  IconDownload,
  IconReplace,
  IconTrash,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { CollectionCreateOrUpdateModal } from "#@/components/collection/form/modal/CollectionCreateOrUpdateModal";
import { CollectionEntriesMoveModal } from "#@/components/collection/collection-entry/form/modal/CollectionEntriesMoveModal";
import { CollectionRemoveModal } from "#@/components/collection/form/modal/CollectionRemoveModal";
import { useOnMobile, useUserId } from "#@/components";
import { Link } from "#@/util";

interface IProps {
  libraryUserId: string;
  collectionId: string;
}

const CollectionViewActions = ({ libraryUserId, collectionId }: IProps) => {
  const userId = useUserId();
  const onMobile = useOnMobile();
  const isOwnCollection = userId != undefined && libraryUserId === userId;

  const [createUpdateModalOpened, createUpdateModalUtils] = useDisclosure();
  const [moveModalOpened, moveModalUtils] = useDisclosure();
  const [removeModalOpened, removeModalUtils] = useDisclosure();
  return (
    <SimpleGrid cols={2}>
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
      <Tooltip label={"Collection settings"}>
        <ActionIcon onClick={() => createUpdateModalUtils.open()}>
          <IconDots size={"1.2rem"} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={"Move games between collections"}>
        <ActionIcon onClick={() => moveModalUtils.open()}>
          <IconReplace size={"1.2rem"} />
        </ActionIcon>
      </Tooltip>
      {onMobile && isOwnCollection && (
        <Tooltip label={"Import games"}>
          <Link href={"/importer"}>
            <ActionIcon>
              <IconDownload size={"1.2rem"} />
            </ActionIcon>
          </Link>
        </Tooltip>
      )}
      <Tooltip label={"Delete collection"}>
        <ActionIcon onClick={() => removeModalUtils.open()}>
          <IconTrash size={"1.2rem"} />
        </ActionIcon>
      </Tooltip>
    </SimpleGrid>
  );
};

export { CollectionViewActions };
