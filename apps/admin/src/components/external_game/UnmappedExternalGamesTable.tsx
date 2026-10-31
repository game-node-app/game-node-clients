import { EGameExternalGameCategory } from "@/components/external_game/constants.ts";
import { useUnmappedExternalGames } from "@/components/external_game/hook/useUnmappedExternalGames.ts";
import { getExternalSourceName } from "@/components/external_game/utils/getExternalSourceName.ts";
import { useCustomTable } from "@/components/table/hooks/use-custom-table.ts";
import { ActionIcon, Button, Stack } from "@mantine/core";
import { UnmappedExternalGame } from "@repo/wrapper/server";
import { IconExternalLink } from "@tabler/icons-react";
import { MantineReactTable, MRT_ColumnDef } from "mantine-react-table";
import { match } from "ts-pattern";

const onVisitClick = (item: UnmappedExternalGame) => {
  const url = match<EGameExternalGameCategory>(
    item.category as unknown as EGameExternalGameCategory,
  )
    .with(
      EGameExternalGameCategory.Steam,
      () => `https://steamdb.info/app/${item.sourceUid}`,
    )
    .otherwise(() => {
      alert("Automatic linking to this source is not yet implemented.");
    });

  if (url) window.open(url, "_blank");
};

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
      return (
        <ActionIcon
          variant={"subtle"}
          onClick={() => onVisitClick(row.original)}
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
    renderRowActions: (props) => {
      return <Button>Match</Button>;
    },
  });

  return (
    <Stack>
      <MantineReactTable table={table} />
    </Stack>
  );
};

export { UnmappedExternalGamesTable };