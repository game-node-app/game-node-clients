import type { Collection } from "@repo/wrapper/server";

/**
 * Drops private collections when the viewer is not the owner.
 *
 * The server already omits them, but lists can be rendered from a cache filled
 * while the viewer was the owner (or before the collection became private).
 * The owner still sees every collection.
 */
export function filterVisibleCollections<
  T extends Pick<Collection, "isPublic">,
>(collections: T[] | undefined, isOwner: boolean): T[] | undefined {
  if (collections == undefined || isOwner) {
    return collections;
  }

  return collections.filter((collection) => collection.isPublic !== false);
}
