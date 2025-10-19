import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ImporterPaginatedResponseDto,
  ImporterService,
} from "../../../../../wrapper/src/server";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

interface Props {
  source: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export function useImporterEntries({
  source,
  offset,
  limit,
  search,
}: Props): ExtendedUseQueryResult<ImporterPaginatedResponseDto> {
  const queryClient = useQueryClient();
  const queryKey = [
    "importer",
    "entries",
    "unprocessed",
    source,
    offset,
    limit,
    search,
  ];
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: queryKey.slice(0, 4),
    });
  };
  return {
    ...useQuery({
      queryKey: queryKey,
      queryFn: async () => {
        return ImporterService.importerControllerFindUnprocessedEntriesV1(
          source,
          limit,
          offset,
          search,
        );
      },
      enabled: source != undefined,
      retry: 1,
    }),
    queryKey,
    invalidate,
  };
}
