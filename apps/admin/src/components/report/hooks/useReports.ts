import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";
import { PaginatedReportResponseDto, ReportService } from "@/wrapper/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useReports(
    offset: number = 0,
    limit: number = 10,
    includeClosed: boolean = false,
): ExtendedUseQueryResult<PaginatedReportResponseDto> {
    const queryClient = useQueryClient();
    const queryKey = ["reports", "all", offset, limit];
    const invalidate = () => {
        queryClient.invalidateQueries({
            // ["reports", "all"]
            queryKey: queryKey.slice(0, 2),
        });
    };
    return {
        ...useQuery({
            queryKey,
            queryFn: async () => {
                return ReportService.reportControllerFindAllByLatestV1(
                    includeClosed,
                    offset,
                    limit,
                );
            },
        }),
        queryKey,
        invalidate,
    };
}
