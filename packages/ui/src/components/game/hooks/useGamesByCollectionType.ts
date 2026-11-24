import {
  FindGamesByCollectionTypeRequestDto,
  type FindGamesByCollectionTypeResponseDto,
  GameRepositoryService,
} from "@repo/wrapper/server";
import { useQuery } from "@tanstack/react-query";

export function useGamesByCollectionType(
  dto: FindGamesByCollectionTypeRequestDto,
) {
  return useQuery({
    queryKey: [
      "game",
      "all",
      "collectionType",
      dto.collectionType,
      dto.from ?? null,
      dto.to ?? null,
      dto.offset,
      dto.limit,
      dto.relations,
    ],
    queryFn: async (): Promise<FindGamesByCollectionTypeResponseDto> => {
      return GameRepositoryService.gameRepositoryControllerGetGameIdsByCollectionTypeV1(
        dto,
      );
    },
  });
}
