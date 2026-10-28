import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  ImporterPaginatedResponseDto,
  ImporterService,
} from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export const EMPTY_IMPORTER_ENTRIES_RESPONSE: ImporterPaginatedResponseDto = {
  data: [],
  pagination: {
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
  },
};

interface Props {
  source: string;
  excludeInLibrary?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

export function useImporterEntries({
  source,
  excludeInLibrary = true,
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
    excludeInLibrary,
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
        try {
          return await ImporterService.importerControllerFindUnprocessedEntriesV1(
            source,
            excludeInLibrary,
            limit,
            offset,
            search,
          );
        } catch (err: unknown) {
          if (
            (err instanceof ApiError || (err as any)?.name === "ApiError") &&
            (err as any)?.status === 404
          ) {
            return EMPTY_IMPORTER_ENTRIES_RESPONSE;
          }
          throw err;
        }
      },
      enabled: source != undefined,
      retry: 1,
    }),
    queryKey,
    invalidate,
  };
}
