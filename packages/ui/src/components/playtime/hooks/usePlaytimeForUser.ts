import { useQuery } from "@tanstack/react-query";
import {
  FindAllPlaytimeFiltersDto,
  FindAllPlaytimeResponseDto,
  PlaytimeService,
} from "@repo/wrapper/server";

interface Props extends FindAllPlaytimeFiltersDto {
  userId: string;
}

export function usePlaytimeForUser({
  userId,
  offset = 0,
  limit = 20,
  period = FindAllPlaytimeFiltersDto.period.ALL,
  orderBy,
}: Props) {
  return useQuery<FindAllPlaytimeResponseDto>({
    queryKey: ["playtime", "user", userId, period, offset, limit, orderBy],
    queryFn: async () => {
      return PlaytimeService.playtimeControllerFindAllByUserIdWithFiltersV1(
        userId,
        {
          offset,
          limit,
          period,
          orderBy,
        },
      );
    },
    staleTime: Infinity,
  });
}
