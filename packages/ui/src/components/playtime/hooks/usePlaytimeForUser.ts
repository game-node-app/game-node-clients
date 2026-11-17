import { useQuery } from "@tanstack/react-query";
import {
  FindAllPlaytimeFiltersDto,
  FindAllPlaytimeResponseDto,
  PlaytimeService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

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
  const viewerId = useUserId();

  return useQuery<FindAllPlaytimeResponseDto>({
    queryKey: [
      "playtime",
      "user",
      userId,
      period,
      offset,
      limit,
      orderBy,
      viewerId ?? null,
    ],
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
