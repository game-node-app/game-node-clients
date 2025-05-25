import { ConnectionCreateDto, ConnectionsService } from "@repo/wrapper/server";
import { useQuery } from "@tanstack/react-query";

export function useUserConnections(userId: string) {
  return useQuery({
    queryKey: ["connections", "user", userId],
    queryFn: async () => {
      return ConnectionsService.connectionsControllerFindAllByUserIdV1(userId);
    },
  });
}
