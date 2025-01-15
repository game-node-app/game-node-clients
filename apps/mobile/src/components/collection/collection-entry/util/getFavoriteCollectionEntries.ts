import { CollectionEntry } from "@repo/wrapper/server";

export default function getFavoriteCollectionEntries(collectionEntries: CollectionEntry[]) {
    return collectionEntries.filter((collection) => collection.isFavorite);
}
