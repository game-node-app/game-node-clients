import { TBasePaginationRequest } from "@/util/types/pagination";
import { useQuery } from "@tanstack/react-query";
import { PlaytimeService } from "@/wrapper/server";

interface Props extends TBasePaginationRequest {
    userId: string;
}

export function usePlaytimeForUser({ userId, offset = 0, limit = 20 }: Props) {
    return useQuery({
        queryKey: ["playtime", "user", userId, offset, limit],
        queryFn: async () => {
            return PlaytimeService.playtimeControllerFindAllByUserIdV1(
                userId,
                offset,
                limit,
            );
        },
        staleTime: Infinity,
    });
}
