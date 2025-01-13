import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ImporterPaginatedResponseDto,
    ImporterService,
} from "@/wrapper/server";
import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";

interface Props {
    source: string;
    limit?: number;
    offset?: number;
}

export function useImporterEntries({
    source,
    offset,
    limit,
}: Props): ExtendedUseQueryResult<ImporterPaginatedResponseDto> {
    const queryClient = useQueryClient();
    const queryKey = [
        "importer",
        "entries",
        "unprocessed",
        source,
        offset,
        limit,
    ];
    const invalidate = () => {
        queryClient.invalidateQueries({
            queryKey: queryKey.slice(0, 4),
        });
    };
    return {
        ...useQuery({
            queryKey: [
                "importer",
                "entries",
                "unprocessed",
                source,
                offset,
                limit,
            ],
            queryFn: async () => {
                return ImporterService.importerControllerFindUnprocessedEntriesV1(
                    source,
                    limit,
                    offset,
                );
            },
            enabled: source != undefined,
        }),
        queryKey,
        invalidate,
    };
}
