import { useQuery } from "@tanstack/react-query";
import { ConnectionsService } from "@/wrapper/server";

export function useAvailableConnections() {
    return useQuery({
        queryKey: ["connections", "available"],
        queryFn: async () => {
            return ConnectionsService.connectionsControllerFindAvailableConnectionsV1();
        },
    });
}
