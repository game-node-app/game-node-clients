import React from "react";
import { ActionIcon, Button, Flex, Stack, Tooltip } from "@mantine/core";
import { useCustomTable } from "@/components/table/hooks/use-custom-table.ts";
import { MantineReactTable, MRT_ColumnDef } from "mantine-react-table";
import { AwardsEvent } from "@repo/wrapper/server";
import { Link, useAwardEvents } from "@repo/ui";
import { CreateUpdateAwardsForm } from "@/components/awards/CreateUpdateAwardsForm.tsx";
import { IconArrowRight, IconEdit } from "@tabler/icons-react";

const COLUMNS: MRT_ColumnDef<AwardsEvent>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableEditing: false,
  },
  {
    accessorKey: "year",
    header: "Year",
  },
  {
    header: "Voting Start Date",
    id: "votingStartDate",
    accessorFn: (row) => new Date(row.votingStartDate).toLocaleString("en-US"),
  },
  {
    header: "Voting End Date",
    id: "votingEndDate",
    accessorFn: (row) => new Date(row.votingEndDate).toLocaleString("en-US"),
  },
];

const AwardsView = () => {
  const { data: events, isLoading } = useAwardEvents();
  const table = useCustomTable({
    columns: COLUMNS,
    data: events ?? [],
    state: {
      isLoading: isLoading,
    },
    initialState: {
      sorting: [
        {
          id: "year",
          desc: true,
        },
      ],
    },
    enableEditing: true,
    renderCreateRowModalContent: ({ row }) => <CreateUpdateAwardsForm />,
    renderTopToolbarCustomActions: ({ table }) => {
      return (
        <Button onClick={() => table.setCreatingRow(true)}>
          Create new event
        </Button>
      );
    },
    renderEditRowModalContent: ({ row }) => (
      <CreateUpdateAwardsForm eventId={row.original?.id} />
    ),
    renderRowActions: ({ row, table }) => (
      <Flex gap="md">
        <Tooltip label="Edit">
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Link href={`/dashboard/awards/${row.original.id}`}>
          <ActionIcon>
            <IconArrowRight />
          </ActionIcon>
        </Link>
      </Flex>
    ),
  });

  return (
    <Stack className={"w-full"}>
      <MantineReactTable table={table} />
    </Stack>
  );
};

export { AwardsView };
