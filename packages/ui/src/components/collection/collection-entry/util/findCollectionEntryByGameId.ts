import { CollectionEntry } from "@repo/wrapper/server";

export function findCollectionEntryByGameId(
  gameId: number | undefined,
  collectionEntries: CollectionEntry[] | undefined,
) {
  if (gameId == undefined || collectionEntries == undefined) return undefined;

  return collectionEntries.find((collection) => collection.gameId === gameId);
}
