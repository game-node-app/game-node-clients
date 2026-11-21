import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useCollectionEntriesForCollectionId } from "#@/components/collection/collection-entry/hooks/useCollectionEntriesForCollectionId";
import { useCollection } from "#@/components/collection/hooks/useCollection";
import { useUserLibrary } from "#@/components/library/hooks/useUserLibrary";
import { Modal } from "#@/util";
import { useTranslation } from "@repo/locales";
import { BaseModalProps } from "#@/util/types/modal-props";
import { Button, Group, Stack, Text } from "@mantine/core";
import { CollectionsService } from "@repo/wrapper/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props extends BaseModalProps {
  collectionId: string;
}

const CollectionRemoveModal = ({ collectionId, opened, onClose }: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();
  useQueryClient();
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
      title={t("collection.remove")}
      centered
    >
      <Stack w={"100%"} justify={"center"}>
        <Text fz={"xl"} className={"text-center"}>
          {t("collection.messages.removeConfirm", {
            name: collectionQuery.data?.name ?? "",
          })}
        </Text>
        <Text fw={"bold"} className={"text-center"}>
          {t("collection.messages.removeNote")}
        </Text>
        <Group wrap={"nowrap"} justify={"center"}>
          <Button onClick={onClose} color={"blue"}>
            {t("actions.goBack")}
          </Button>
          <Button
            onClick={() => {
              collectionRemoveMutation.mutate(collectionId);
              onClose();
            }}
            color={"red"}
          >
            {t("actions.confirm")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export { CollectionRemoveModal };
