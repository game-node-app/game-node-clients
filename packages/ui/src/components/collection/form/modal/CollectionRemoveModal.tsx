import React from "react";
import { BaseModalProps } from "#@/util/types/modal-props";
import { Button, Group, Stack, Text } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollectionsService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useUserLibrary } from "#@/components/library/hooks/useUserLibrary";
import { useCollection } from "#@/components/collection/hooks/useCollection";
import { useCollectionEntriesForCollectionId } from "#@/components/collection/collection-entry/hooks/useCollectionEntriesForCollectionId";
import { Modal } from "#@/util";

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
    onSuccess: () => {},
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Remove collection"}
      centered
    >
      <Stack w={"100%"} justify={"center"}>
        <Text fz={"xl"} className={"text-center"}>
          Are you sure you want to remove your &#34;{collectionQuery.data?.name}
          &#34; collection?
        </Text>
        <Text fw={"bold"} className={"text-center"}>
          The games in this collection will remain intact in your library, and
          you may add them to other collections later.
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
    </Modal>
  );
};

export { CollectionRemoveModal };
