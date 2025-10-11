import React from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollectionsEntriesService } from "@repo/wrapper/server";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import {
  BaseModalProps,
  EMatomoEventAction,
  EMatomoEventCategory,
  trackMatomoEvent,
  Modal,
  createErrorNotification,
} from "#@/util";
import { useOwnCollectionEntryForGameId } from "#@/components";

interface ICollectionEntryRemoveModalProps extends BaseModalProps {
  gameId: number;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

const CollectionEntryRemoveModal = ({
  gameId,
  onSuccess,
  onError,
  onClose,
  opened,
}: ICollectionEntryRemoveModalProps) => {
  const queryClient = useQueryClient();
  const collectionEntriesQuery = useOwnCollectionEntryForGameId(gameId);
  const collectionEntryRemoveMutation = useMutation({
    mutationFn: (entryId: string) => {
      return CollectionsEntriesService.collectionsEntriesControllerDeleteOwnEntryV1(
        entryId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-entries"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
      trackMatomoEvent(
        EMatomoEventCategory.CollectionEntry,
        EMatomoEventAction.Remove,
        "Removed game from collection",
      );
      onSuccess?.();
    },
    onError: (error) => {
      console.error(error);
      createErrorNotification(error);
      onError?.(error);
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title={"Remove game"} centered>
      <SessionAuth>
        <Stack justify={"center"} w={"100%"} ta={"center"}>
          <Text fz={"lg"}>
            You are about to <strong>remove</strong> this game and any related
            data <strong>(including reviews!)</strong> from your library.
          </Text>
          <Text c={"dimmed"} fz={"sm"}>
            If you wish to <strong>move</strong> this game between collections,
            you can use the Update option instead.
          </Text>
          <Text>Are you sure?</Text>
          <Group wrap={"nowrap"} justify={"center"}>
            <Button onClick={onClose} color={"blue"}>
              No
            </Button>
            <Button
              onClick={() => {
                if (collectionEntriesQuery.data) {
                  collectionEntryRemoveMutation.mutate(
                    collectionEntriesQuery.data.id,
                  );
                  onClose();
                }
              }}
              color={"red"}
            >
              Yes
            </Button>
          </Group>
        </Stack>
      </SessionAuth>
    </Modal>
  );
};

export { CollectionEntryRemoveModal };
