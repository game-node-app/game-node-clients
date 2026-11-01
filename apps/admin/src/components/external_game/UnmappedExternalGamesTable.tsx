import { MatchExternalGameModal } from "@/components/external_game/MatchExternalGameModal.tsx";
import { getExternalLookupUrl } from "@/components/external_game/utils/getExternalLookupUrl.ts";
import { useUnmappedExternalGames } from "@/components/external_game/hook/useUnmappedExternalGames.ts";
import { getExternalSourceName } from "@/components/external_game/utils/getExternalSourceName.ts";
import { useCustomTable } from "@/components/table/hooks/use-custom-table.ts";
import { ActionIcon, Button, Stack } from "@mantine/core";
import { useState } from "react";
import { UnmappedExternalGame } from "@repo/wrapper/server";
import { IconExternalLink } from "@tabler/icons-react";
import { MantineReactTable, MRT_ColumnDef } from "mantine-react-table";

const COLUMNS: MRT_ColumnDef<UnmappedExternalGame>[] = [
  {
    header: "Source",
    accessorFn: (row) => getExternalSourceName(row.category),
  },
  {
    header: "Source ID",
    accessorKey: "sourceUid",
  },
  {
    header: "Visit",
    Cell: ({ row }) => {
      const url = getExternalLookupUrl(row.original);
      return (
        <ActionIcon
          variant={"subtle"}
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          disabled={!url}
          aria-label="Open external lookup"
        >
          <IconExternalLink />
        </ActionIcon>
      );
    },
  },
];

const UnmappedExternalGamesTable = () => {
  const { data, isLoading, isError, isFetching } = useUnmappedExternalGames();

  const items = data ?? [];
  const [matching, setMatching] = useState<UnmappedExternalGame>();

  const table = useCustomTable<UnmappedExternalGame>({
    data: items,
    columns: COLUMNS,
    state: {
      isLoading: isLoading,
      showAlertBanner: isError,
      showProgressBars: isFetching,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },
    },
    enableRowActions: true,
    renderRowActions: ({ row }) => {
      return <Button onClick={() => setMatching(row.original)}>Match</Button>;
    },
  });

  return (
    <Stack>
      <MantineReactTable table={table} />
      {matching && (
        <MatchExternalGameModal
          key={matching.id}
          item={matching}
          opened
          onClose={() => setMatching(undefined)}
        />
      )}
    </Stack>
  );
};

export { UnmappedExternalGamesTable };
