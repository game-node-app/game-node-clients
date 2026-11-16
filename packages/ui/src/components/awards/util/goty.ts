/**
 * Identifies the global GOTY category by its `isGOTY` flag. Callers must join
 * ballot/vote/result category ids with these categories: names and `order`
 * are admin-editable and never identify a category.
 */

export function isGlobalGOTYCategory(
  category: { isGOTY?: boolean } | null | undefined,
): boolean {
  return category?.isGOTY === true;
}

/** The global GOTY category among `categories`, or null when there is none. */
export function findGlobalGOTYCategory<T extends { isGOTY?: boolean }>(
  categories: readonly T[] | null | undefined,
): T | null {
  if (!categories) {
    return null;
  }

  return categories.find((category) => isGlobalGOTYCategory(category)) ?? null;
}

/**
 * The item (ballot category, vote, result) that belongs to the global GOTY
 * category, using the id the read exposes (`id` on ballot categories,
 * `categoryId` on votes and results).
 */
export function findGlobalGOTYCategoryItem<T>(
  items: readonly T[] | null | undefined,
  categories: readonly { id: number; isGOTY?: boolean }[] | null | undefined,
  getCategoryId: (item: T) => number | null | undefined,
): T | null {
  const gotyCategory = findGlobalGOTYCategory(categories);
  if (!gotyCategory || !items) {
    return null;
  }

  return items.find((item) => getCategoryId(item) === gotyCategory.id) ?? null;
}

/** Copy of the categories sorted by `order` ascending (G18). */
export function sortByCategoryOrder<T extends { order?: number | null }>(
  categories: readonly T[] | null | undefined,
): T[] {
  if (!categories) {
    return [];
  }

  return [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
