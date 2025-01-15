import { useQuery } from "@tanstack/react-query";
import { ConnectionsService } from "../../../../../wrapper/src/server";
import { ConnectionCreateDto } from "../../../../../wrapper/src/server";
import type = ConnectionCreateDto.type;

export function useOwnUserConnectionByType(type: type) {
  return useQuery({
    queryKey: ["connections", "own", type],
    queryFn: async () => {
      return ConnectionsService.connectionsControllerFindOwnByTypeV1(type);
    },
    retry: 1,
  });
}
