import {
  FindGamesByCollectionTypeRequestDto,
  type FindGamesByCollectionTypeResponseDto,
  GameRepositoryService,
} from "@repo/wrapper/server";
import { useQuery } from "@tanstack/react-query";

import CollectionType = FindGamesByCollectionTypeRequestDto.collectionType;

/**
 * Games of a collection type, soonest/newest first.
 * The API returns both windows oldest first, so recently released would start a month ago:
 * for it, `offset` counts from the newest end, read through the window's total.
 */
export function useGamesByCollectionType(
  dto: FindGamesByCollectionTypeRequestDto,
) {
  const fromNewest = dto.collectionType === CollectionType.RECENTLY_RELEASED;
  const totalQuery = useQuery({
    queryKey: ["game", "all", "collectionType", dto.collectionType, "total"],
    queryFn: () =>
      GameRepositoryService.gameRepositoryControllerGetGameIdsByCollectionTypeV1(
        { collectionType: dto.collectionType, limit: 1 },
      ) as Promise<FindGamesByCollectionTypeResponseDto>,
    enabled: fromNewest,
  });
  const total = totalQuery.data?.pagination.totalItems;

  return useQuery({
    queryKey: [
      "game",
      "all",
      "collectionType",
      dto.collectionType,
      dto.offset,
      dto.limit,
      dto.relations,
      total,
    ],
    queryFn: async (): Promise<FindGamesByCollectionTypeResponseDto> => {
      if (!fromNewest || total == undefined) {
        return GameRepositoryService.gameRepositoryControllerGetGameIdsByCollectionTypeV1(
          dto,
        );
      }
      const limit = dto.limit ?? 20;
      const end = Math.max(0, total - (dto.offset ?? 0));
      const offset = Math.max(0, end - limit);
      if (end === offset) {
        // limit 0 would mean "default page size" to the API
        return { ...totalQuery.data!, data: [] };
      }
      const response: FindGamesByCollectionTypeResponseDto =
        await GameRepositoryService.gameRepositoryControllerGetGameIdsByCollectionTypeV1(
          { ...dto, offset, limit: end - offset },
        );
      return { ...response, data: [...response.data].reverse() };
    },
    enabled: !fromNewest || totalQuery.isSuccess,
  });
}
