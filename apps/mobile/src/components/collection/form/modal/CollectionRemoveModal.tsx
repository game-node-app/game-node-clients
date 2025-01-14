import React from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import { Button, Container, Group, Modal, Stack, Text } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollectionsService } from "@/wrapper/server";
import useUserId from "@/components/auth/hooks/useUserId";
import { useUserLibrary } from "@/components/library/hooks/useUserLibrary";
import { useCollection } from "@/components/collection/hooks/useCollection";
import { useCollectionEntriesForCollectionId } from "@/components/collection/collection-entry/hooks/useCollectionEntriesForCollectionId";
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from "@ionic/react";
import ActionConfirm from "@/components/general/ActionConfirm";

interface Props extends BaseModalProps {
    collectionId: string;
}

const CollectionRemoveModal = ({ collectionId, opened, onClose }: Props) => {
    const userId = useUserId();
    const queryClient = useQueryClient();
    const libraryQuery = useUserLibrary(userId);
    const collectionQuery = useCollection(collectionId);
    const collectionEntriesQuery = useCollectionEntriesForCollectionId({
        collectionId,
    });
    const collectionRemoveMutation = useMutation({
        mutationFn: (collectionId: string) => {
            return CollectionsService.collectionsControllerDeleteV1(collectionId);
        },
        onSettled: () => {
            libraryQuery.invalidate();
            collectionQuery.invalidate();
            collectionEntriesQuery.invalidate();
            libraryQuery.invalidate();
        },
        onSuccess: () => {
            onClose();
        },
    });

    return (
        <IonModal isOpen={opened} onDidDismiss={onClose} initialBreakpoint={0.75} breakpoints={[0, 0.25, 0.5, 0.75, 1]}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Remove collection</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Container fluid className="my-4">
                    <Stack w={"100%"} justify={"center"}>
                        <Text fz={"xl"} className={"text-center"}>
                            Are you sure you want to remove this collection?
                        </Text>
                        <Text fw={"bold"} className={"text-center"}>
                            This will also remove all games from this collection. If the games aren&apos;t available in
                            other collections, your reviews from them will also be removed.
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
                </Container>
            </IonContent>
        </IonModal>
    );
};

export default CollectionRemoveModal;
