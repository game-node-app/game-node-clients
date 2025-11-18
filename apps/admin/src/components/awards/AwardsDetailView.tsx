import React, { useMemo, useState } from "react";
import {
  CenteredLoading,
  useAwardEvent,
  useAwardEventCategories,
} from "@repo/ui";
import {
  ActionIcon,
  Button,
  Flex,
  Modal,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import { useCustomTable } from "@/components/table/hooks/use-custom-table.ts";
import { MantineReactTable, MRT_ColumnDef } from "mantine-react-table";
import { VotableAwardsCategoryDto } from "@repo/wrapper/server";
import {
  IconDeviceGamepad2,
  IconDeviceGamepad3Filled,
  IconEdit,
  IconSubmarine,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { AwardsCategorySuggestionView } from "@/components/awards/AwardsCategorySuggestionView.tsx";
import { CreateUpdateAwardsCategoryForm } from "@/components/awards/form/CreateUpdateAwardsCategoryForm.tsx";

const COLUMNS: MRT_ColumnDef<VotableAwardsCategoryDto>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "order",
    header: "Ordering",
  },
  {
    accessorKey: "isVotable",
    header: "Is currently votable",
    Cell: ({ row }) => {
      return row.original.isVotable ? "Yes" : "No";
    },
  },
];

interface Props {
  eventId: number;
}

const AwardsDetailView = ({ eventId }: Props) => {
  const {
    data: eventCategories,
    isLoading,
    isError,
  } = useAwardEventCategories(eventId);

  const [suggestionsModalOpened, suggestionsModalUtils] = useDisclosure();
  const [editingCategoryId, setEditingCategoryId] = useState<
    number | undefined
  >(undefined);

  const editingCategory = useMemo(() => {
    return eventCategories?.find(
      (category) => category.id === editingCategoryId,
    );
  }, [eventCategories, editingCategoryId]);

  const table = useCustomTable({
    data: eventCategories ?? [],
    columns: COLUMNS,
    enableEditing: true,
    state: {
      isLoading,
    },
    renderCreateRowModalContent: () => {
      return <CreateUpdateAwardsCategoryForm eventId={eventId} />;
    },
    renderEditRowModalContent: ({ row }) => {
      return (
        <CreateUpdateAwardsCategoryForm
          eventId={eventId}
          categoryId={row.original?.id}
        />
      );
    },
    renderTopToolbarCustomActions: ({ table }) => {
      return (
        <Button onClick={() => table.setCreatingRow(true)}>
          Add new category
        </Button>
      );
    },
    renderRowActions: ({ table, row }) => {
      return (
        <Flex gap="md">
          <Tooltip label={"Edit category"}>
            <ActionIcon onClick={() => table.setEditingRow(row)}>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={"Add/remove nominees"}>
            <ActionIcon
              onClick={() => {
                setEditingCategoryId(row.original.id);
                suggestionsModalUtils.open();
              }}
            >
              <IconDeviceGamepad2 />
            </ActionIcon>
          </Tooltip>
        </Flex>
      );
    },
  });

  if (isLoading) return <CenteredLoading />;
  return (
    <Stack>
      <Title size={"h4"}>Categories</Title>
      <Modal
        opened={suggestionsModalOpened && editingCategory !== undefined}
        onClose={suggestionsModalUtils.close}
        keepMounted={false}
        title={"Suggested games"}
        size={"xl"}
      >
        <AwardsCategorySuggestionView category={editingCategory!} />
      </Modal>
      <MantineReactTable table={table} />
    </Stack>
  );
};

export { AwardsDetailView };
