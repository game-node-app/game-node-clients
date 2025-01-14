import { ExtendedUseInfiniteQueryResult } from "@/util/types/ExtendedUseQueryResult";
import { ImporterPaginatedResponseDto, ImporterService } from "@/wrapper/server";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

interface Props {
    source: string;
    limit?: number;
    offset?: number;
}

export function useInfiniteImporterEntries({
    source,
    offset,
    limit = 20,
}: Props): ExtendedUseInfiniteQueryResult<ImporterPaginatedResponseDto> {
    const queryClient = useQueryClient();
    const queryKey = ["importer", "infinite", "entries", "unprocessed", source, offset, limit];
    const invalidate = () => {
        queryClient.invalidateQueries({
            queryKey: queryKey.slice(0, 4),
        });
    };

    return {
        ...useInfiniteQuery({
            queryKey,
            queryFn: async () => {
                return ImporterService.importerControllerFindUnprocessedEntriesV1(source, limit, offset);
            },
            getNextPageParam: (previousData, allData, lastPageParam) => {
                return lastPageParam + limit;
            },
            initialPageParam: 0,
            enabled: source != undefined,
        }),
        queryKey,
        invalidate,
    };
}
