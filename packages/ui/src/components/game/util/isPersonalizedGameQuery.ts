/**
 * Whether a game query key carries a cover context, i.e. its data was resolved
 * for a specific viewer, owner and display mode. Unpersonalized game keys stay
 * byte-identical to their pre-personalization form and never match.
 */
export function isPersonalizedGameQuery(queryKey: readonly unknown[]): boolean {
  if (queryKey[0] !== "game") return false;

  const last = queryKey[queryKey.length - 1];
  return (
    last !== null &&
    typeof last === "object" &&
    Object.prototype.hasOwnProperty.call(last, "coverContext")
  );
}
