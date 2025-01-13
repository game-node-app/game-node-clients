import React from "react";
import { ActionIcon, Group, GroupProps, Tooltip } from "@mantine/core";
import { IconDots, IconReplace, IconTrash } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import CollectionCreateOrUpdateModal from "@/components/collection/form/modal/CollectionCreateOrUpdateModal";
import CollectionEntriesMoveModal from "@/components/collection/collection-entry/form/modal/CollectionEntriesMoveModal";
import CollectionRemoveModal from "@/components/collection/form/modal/CollectionRemoveModal";

interface IProps extends GroupProps {
    collectionId: string;
}

const CollectionViewActions = ({ collectionId, ...groupProps }: IProps) => {
    const [createUpdateModalOpened, createUpdateModalUtils] = useDisclosure();
    const [moveModalOpened, moveModalUtils] = useDisclosure();
    const [removeModalOpened, removeModalUtils] = useDisclosure();
    return (
        <Group justify={"end"}>
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
            <Tooltip label={"Delete collection"}>
                <ActionIcon onClick={() => removeModalUtils.open()}>
                    <IconTrash size={"1.2rem"} />
                </ActionIcon>
            </Tooltip>
        </Group>
    );
};

export default CollectionViewActions;
