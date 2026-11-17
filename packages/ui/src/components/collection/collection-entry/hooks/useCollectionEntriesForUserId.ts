import { useQuery } from "@tanstack/react-query";
import {
  CollectionEntry,
  CollectionsEntriesService,
  FindCollectionEntriesGameFilterDto,
  FindCollectionEntriesOrderBy,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export interface UseCollectionEntriesForUserIdProps {
  userId: string;
  offset?: number;
  limit?: number;
  orderBy?: FindCollectionEntriesOrderBy;
  status?: CollectionEntry.status;
  gameFilters?: FindCollectionEntriesGameFilterDto;
  hasCustomCover?: boolean;
}

export function useCollectionEntriesForUserId({
  userId,
  offset = 0,
  limit = 20,
  orderBy,
  status,
  gameFilters,
  hasCustomCover,
}: UseCollectionEntriesForUserIdProps) {
  const viewerId = useUserId();

  return useQuery({
    queryKey: [
      "collection-entries",
      "all",
      userId,
      offset,
      limit,
      orderBy,
      gameFilters,
      status,
      ...(hasCustomCover ? [{ hasCustomCover: true }] : []),
      // Hidden entries are filtered per viewer, so the viewer id belongs to the key.
      viewerId ?? null,
    ],
    queryFn: async () => {
      return CollectionsEntriesService.collectionsEntriesControllerFindAllByLibraryIdV1(
        userId,
        orderBy,
        status,
        gameFilters,
        hasCustomCover ? true : undefined,
        offset,
        limit,
      );
    },
    enabled: userId != undefined,
  });
}
