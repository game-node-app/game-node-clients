import React from "react";
import { ActionIcon, Button, Stack } from "@mantine/core";
import { MantineReactTable, MRT_ColumnDef } from "mantine-react-table";
import { IconEdit } from "@tabler/icons-react";
import { AchievementEvent } from "@repo/wrapper/server";
import { Link } from "@repo/ui";
import { useCustomTable } from "@/components/table/hooks/use-custom-table.ts";
import { useAdminEvents } from "./hooks";

const COLUMNS: MRT_ColumnDef<AchievementEvent>[] = [
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "status", header: "Status" },
  {
    id: "startsAt",
    header: "Starts",
    accessorFn: (row) => new Date(row.startsAt).toLocaleString("en-US"),
  },
  {
    id: "endsAt",
    header: "Ends",
    accessorFn: (row) => new Date(row.endsAt).toLocaleString("en-US"),
  },
];

const EventsView = () => {
  const eventsQuery = useAdminEvents();
  const table = useCustomTable({
    columns: COLUMNS,
    data: eventsQuery.data ?? [],
    state: { isLoading: eventsQuery.isLoading },
    enableRowActions: true,
    renderTopToolbarCustomActions: () => (
      <Link href={"/dashboard/achievement/events/new"}>
        <Button>Create event</Button>
      </Link>
    ),
    renderRowActions: ({ row }) => (
      <Link href={`/dashboard/achievement/events/${row.original.id}`}>
        <ActionIcon>
          <IconEdit />
        </ActionIcon>
      </Link>
    ),
  });

  return (
    <Stack className={"w-full"}>
      <MantineReactTable table={table} />
    </Stack>
  );
};

export { EventsView };
