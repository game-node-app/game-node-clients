import React from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollectionsEntriesService } from "@repo/wrapper/server";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { BaseModalProps, createErrorNotification, Modal } from "#@/util";
import { useOwnCollectionEntryForGameId } from "#@/components";
import { useTranslation } from "@repo/locales";

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
  const { t } = useTranslation();
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
      onSuccess?.();
    },
    onError: (error) => {
      console.error(error);
      createErrorNotification(error);
      onError?.(error);
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("collection.removeGame")}
      centered
    >
      <SessionAuth>
        <Stack justify={"center"} w={"100%"} ta={"center"}>
          <Text fz={"lg"}>{t("collectionEntry.messages.removeWarning")}</Text>
          <Text c={"dimmed"} fz={"sm"}>
            {t("collectionEntry.messages.moveHint")}
          </Text>
          <Text>{t("collectionEntry.messages.confirmRemove")}</Text>
          <Group wrap={"nowrap"} justify={"center"}>
            <Button onClick={onClose} color={"blue"}>
              {t("actions.no")}
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
              {t("actions.yes")}
            </Button>
          </Group>
        </Stack>
      </SessionAuth>
    </Modal>
  );
};

export { CollectionEntryRemoveModal };
