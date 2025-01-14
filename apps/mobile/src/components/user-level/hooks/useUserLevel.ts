import { useQuery } from "@tanstack/react-query";
import { LevelService } from "@/wrapper/server";

export function useUserLevel(targetUserId: string) {
    return useQuery({
        queryKey: ["user-level", targetUserId],
        queryFn: () => {
            return LevelService.levelControllerFindOneV1(targetUserId);
        },
        enabled: targetUserId != undefined,
    });
}
