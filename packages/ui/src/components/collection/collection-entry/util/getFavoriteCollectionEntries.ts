import { CollectionEntry } from "../../../../../../wrapper/src/server";

export default function getFavoriteCollectionEntries(
  collectionEntries: CollectionEntry[],
) {
  return collectionEntries.filter((collection) => collection.isFavorite);
}
