/**
 * The three library visibility levels supported by the server.
 *
 * Matches `CollectionEntry.visibility`, `ProfileResponseDto.libraryVisibility`,
 * `UpdateProfileDto.libraryVisibility` and
 * `CollectionEntryVisibilityDto.visibility`, which all use the same values.
 *
 * A profile's `libraryVisibility` is a ceiling: the effective visibility of a
 * game is the stricter of the library level and the entry's own level.
 */
export type LibraryVisibilityLevel = "public" | "followers" | "private";

/** Least restrictive to most restrictive, the order used by selects. */
export const LIBRARY_VISIBILITY_LEVELS: readonly LibraryVisibilityLevel[] = [
  "public",
  "followers",
  "private",
];

export function isLibraryVisibilityLevel(
  value: unknown,
): value is LibraryVisibilityLevel {
  return value === "public" || value === "followers" || value === "private";
}

/**
 * Narrows a generated enum value (e.g. `CollectionEntry.visibility`) to the
 * shared level type, returning `undefined` for anything unknown so a new
 * server value can never render a wrong badge.
 */
export function toLibraryVisibilityLevel(
  value: unknown,
): LibraryVisibilityLevel | undefined {
  return isLibraryVisibilityLevel(value) ? value : undefined;
}
