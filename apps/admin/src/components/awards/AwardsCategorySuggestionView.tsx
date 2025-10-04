import React from "react";
import {
  AwardsService,
  Game,
  VotableAwardsCategoryDto,
} from "@repo/wrapper/server";
import { Button, Stack, Text } from "@mantine/core";
import {
  createErrorNotification,
  GameSearchSelectModal,
  useGames,
} from "@repo/ui";
import { MantineReactTable, MRT_ColumnDef } from "mantine-react-table";
import { useCustomTable } from "@/components/table/hooks/use-custom-table.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

  const table = useCustomTable({
    data: games ?? [],
    columns: COLUMNS,
    enableEditing: true,
    state: {
      isLoading,
      isSaving: addSuggestionMutation.isPending,
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
        <Button onClick={() => table.setCreatingRow(true)}>
          Add suggestion
        </Button>
      );
    },
  });

  return (
    <Stack>
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
