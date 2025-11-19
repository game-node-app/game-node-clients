import React, { useRef } from "react";
import {
  AwardsService,
  Game,
  VotableAwardsCategoryDto,
} from "@repo/wrapper/server";
import { ActionIcon, Button, Flex, Stack, Text, Tooltip } from "@mantine/core";
import {
  ActionConfirm,
  createErrorNotification,
  GameSearchSelectModal,
  useGames,
} from "@repo/ui";
import { MantineReactTable, MRT_ColumnDef } from "mantine-react-table";
import { useCustomTable } from "@/components/table/hooks/use-custom-table.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconTrash } from "@tabler/icons-react";

const COLUMNS: MRT_ColumnDef<Game>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
];

interface Props {
  category: VotableAwardsCategoryDto;
}

const AwardsCategorySuggestionView = ({ category }: Props) => {
  const queryClient = useQueryClient();

  const removedGameIdRef = useRef<number>(null);
  const [removeModalOpened, removeModalUtils] = useDisclosure();

  const suggestions = category.suggestions;

  const { data: games, isLoading } = useGames({
    gameIds: suggestions.map((s) => s.gameId),
    relations: {
      cover: true,
    },
  });

  const addSuggestionMutation = useMutation({
    mutationFn: async (gameId: number) => {
      await AwardsService.awardsAdminControllerAddCategorySuggestionV1({
        categoryId: category.id,
        gameId: gameId,
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["awards", "event", category.eventId, "categories"],
      });
    },
    onError: createErrorNotification,
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });

  const removeSuggestionMutation = useMutation({
    mutationFn: async () => {
      const gameId = removedGameIdRef.current;
      if (!gameId) return;
      await AwardsService.awardsAdminControllerRemoveCategorySuggestionV1({
        categoryId: category.id,
        gameId: gameId,
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["awards", "event", category.eventId, "categories"],
      });
      removedGameIdRef.current = null;
    },
    onError: createErrorNotification,
  });

  const table = useCustomTable({
    data: games ?? [],
    columns: COLUMNS,
    enableEditing: true,
    state: {
      isLoading,
      isSaving: addSuggestionMutation.isPending,
    },
    renderRowActions: ({ row }) => {
      return (
        <Flex gap="md">
          <Tooltip label="Edit">
            <ActionIcon onClick={() => table.setEditingRow(row)}>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon
              color="red"
              onClick={() => {
                removedGameIdRef.current = row.original.id;
                removeModalUtils.open();
              }}
            >
              <IconTrash />
            </ActionIcon>
          </Tooltip>
        </Flex>
      );
    },
    renderCreateRowModalContent: ({ table }) => {
      return (
        <GameSearchSelectModal
          onSelected={(gameId) => {
            console.log("Selected: ", gameId);
            addSuggestionMutation.mutate(gameId);
          }}
          opened={true}
          onClose={() => table.setCreatingRow(null)}
        />
      );
    },
    renderTopToolbarCustomActions: ({ table }) => {
      return (
        <Button onClick={() => table.setCreatingRow(true)}>Add nominee</Button>
      );
    },
  });

  return (
    <Stack>
      <ActionConfirm
        message={"Are you sure you want to remove this nominee?"}
        onConfirm={() => {
          removeSuggestionMutation.mutate();
        }}
        opened={removeModalOpened}
        onClose={removeModalUtils.close}
      />
      <Text className={"text-dimmed"}>
        These games will be suggested to users when voting in the &#34;
        {category.name}&#34; category. Choose with care!
      </Text>
      {category.isPersonalGOTY && (
        <Text className={"text-dimmed text-yellow-200"}>
          You are editing a &#34;Personal GOTY&#34; category. These suggestions
          will be ignored.
        </Text>
      )}
      <MantineReactTable table={table} />
    </Stack>
  );
};

export { AwardsCategorySuggestionView };
