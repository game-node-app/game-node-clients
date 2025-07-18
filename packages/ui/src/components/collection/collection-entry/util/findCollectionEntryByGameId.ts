import { CollectionEntry } from "@repo/wrapper/server";

export function findCollectionEntryByGameId(
  gameId: number,
  collectionEntries: CollectionEntry[] | undefined,
) {
  return collectionEntries?.find((collection) => collection.gameId === gameId);
}
