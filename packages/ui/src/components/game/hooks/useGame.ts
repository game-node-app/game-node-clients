import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  Game,
  GameRepositoryFindOneDto,
  GameRepositoryService,
} from "@repo/wrapper/server";
import { GameCoverArg } from "#@/components/game/util/gameCoverRequest";
import { useGameCoverRequest } from "#@/components/game/hooks/useGameCoverRequest";

export function useGame(
  id: number | undefined,
  dto: GameRepositoryFindOneDto,
  cover?: GameCoverArg,
): UseQueryResult<Game | null> {
  const queryClient = useQueryClient();
  const { fields, keyPart } = useGameCoverRequest(
    !!dto.relations?.cover,
    cover,
  );
  const defaultQueryKey = ["game", id, dto];
  const queryKey = keyPart
    ? [...defaultQueryKey, { coverContext: keyPart }]
    : defaultQueryKey;

  return useQuery<Game | null>({
    queryKey,
    queryFn: async () => {
      if (!id) {
        return null;
      }
      return GameRepositoryService.gameRepositoryControllerFindOneByIdV1(
        id,
        keyPart ? { ...dto, ...fields } : dto,
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes,
    enabled: !!id,
    // While session/profile resolve, the unpersonalized read is already cached:
    // show it instead of a loading state (design Decision 3).
    placeholderData: keyPart
      ? () => queryClient.getQueryData<Game | null>(defaultQueryKey)
      : undefined,
  });
}
