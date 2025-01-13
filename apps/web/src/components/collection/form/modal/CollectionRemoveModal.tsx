import React from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollectionsService } from "@/wrapper/server";
import useUserId from "@/components/auth/hooks/useUserId";
import { useUserLibrary } from "@/components/library/hooks/useUserLibrary";
import { useCollection } from "@/components/collection/hooks/useCollection";
import { useCollectionEntriesForCollectionId } from "@/components/collection/collection-entry/hooks/useCollectionEntriesForCollectionId";
import { useRouter } from "next/router";
import {
    EMatomoEventAction,
    EMatomoEventCategory,
    trackMatomoEvent,
} from "@/util/trackMatomoEvent";

interface Props extends BaseModalProps {
    collectionId: string;
}

const CollectionRemoveModal = ({ collectionId, opened, onClose }: Props) => {
    const router = useRouter();
    const userId = useUserId();
    const queryClient = useQueryClient();
    const libraryQuery = useUserLibrary(userId);
    const collectionQuery = useCollection(collectionId);
    const collectionEntriesQuery = useCollectionEntriesForCollectionId({
        collectionId,
    });
    const collectionRemoveMutation = useMutation({
        mutationFn: (collectionId: string) => {
            return CollectionsService.collectionsControllerDeleteV1(
                collectionId,
            );
        },
        onSettled: () => {
            libraryQuery.invalidate();
            collectionQuery.invalidate();
            collectionEntriesQuery.invalidate();
            libraryQuery.invalidate();
        },
        onSuccess: () => {
            trackMatomoEvent(
                EMatomoEventCategory.Collection,
                EMatomoEventAction.Remove,
                "Removed collection",
            );
            router.push(`/library/${userId}`);
        },
    });

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={"Remove collection"}
            centered
        >
            <Modal.Body>
                <Stack w={"100%"} justify={"center"}>
                    <Text fz={"xl"} className={"text-center"}>
                        Are you sure you want to remove this collection?
                    </Text>
                    <Text fw={"bold"} className={"text-center"}>
                        This will also remove all games from this collection. If
                        the games aren't available in other collections, your
                        reviews from them will also be removed.
                    </Text>
                    <Group wrap={"nowrap"} justify={"center"}>
                        <Button onClick={onClose} color={"blue"}>
                            Go back
                        </Button>
                        <Button
                            onClick={() => {
                                collectionRemoveMutation.mutate(collectionId);
                                onClose();
                            }}
                            color={"red"}
                        >
                            Confirm
                        </Button>
                    </Group>
                </Stack>
            </Modal.Body>
        </Modal>
    );
};

export default CollectionRemoveModal;
