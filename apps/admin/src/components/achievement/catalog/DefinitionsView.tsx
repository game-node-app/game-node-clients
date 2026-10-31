import React, { useMemo, useState } from "react";
import { ActionIcon, Button, SegmentedControl, Stack } from "@mantine/core";
import { MantineReactTable, MRT_ColumnDef } from "mantine-react-table";
import { IconEdit } from "@tabler/icons-react";
import { AchievementDefinition } from "@repo/wrapper/server";
import { Link } from "@repo/ui";
import { useCustomTable } from "@/components/table/hooks/use-custom-table.ts";
import { useAdminDefinitions } from "./hooks";

const COLUMNS: MRT_ColumnDef<AchievementDefinition>[] = [
  { accessorKey: "id", header: "Slug" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "metric", header: "Metric" },
  { accessorKey: "status", header: "Status" },
  {
    id: "event",
    header: "Event",
    accessorFn: (row) => row.event?.name ?? "",
  },
  {
    id: "tiers",
    header: "Tiers",
    accessorFn: (row) => row.tiers?.length ?? 0,
  },
];

const DefinitionsView = () => {
  const definitionsQuery = useAdminDefinitions();
  const [status, setStatus] = useState("all");

  const data = useMemo(
    () =>
      (definitionsQuery.data ?? []).filter(
        (d) => status === "all" || d.status === status,
      ),
    [definitionsQuery.data, status],
  );

  const table = useCustomTable({
    columns: COLUMNS,
    data,
    state: { isLoading: definitionsQuery.isLoading },
    enableRowActions: true,
    renderTopToolbarCustomActions: () => (
      <Link href={"/dashboard/achievement/definitions/new"}>
        <Button>Create definition</Button>
      </Link>
    ),
    renderRowActions: ({ row }) => (
      <Link href={`/dashboard/achievement/definitions/${row.original.id}`}>
        <ActionIcon>
          <IconEdit />
        </ActionIcon>
      </Link>
    ),
  });

  return (
    <Stack className={"w-full"}>
      <SegmentedControl
        value={status}
        onChange={setStatus}
        data={[
          { label: "All", value: "all" },
          { label: "Draft", value: "draft" },
          { label: "Published", value: "published" },
          { label: "Archived", value: "archived" },
        ]}
      />
      <MantineReactTable table={table} />
    </Stack>
  );
};

export { DefinitionsView };
