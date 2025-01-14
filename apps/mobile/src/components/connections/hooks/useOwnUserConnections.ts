import { useQuery } from "@tanstack/react-query";
import { ConnectionsService } from "@/wrapper/server";

/**
 * Returns the connections persisted by the current logged-in user.
 */
export function useOwnUserConnections() {
    return useQuery({
        queryKey: ["connections", "own"],
        queryFn: async () => {
            return ConnectionsService.connectionsControllerFindOwnV1();
        },
        retry: 1,
    });
}
