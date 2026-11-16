import { describe, expect, it } from "vitest";
import {
  findGlobalGOTYCategory,
  findGlobalGOTYCategoryItem,
  isGlobalGOTYCategory,
  sortByCategoryOrder,
} from "../../../../../packages/ui/src/components/awards/util/goty";

const categories = [
  {
    id: 10,
    name: "Your Game of the Year",
    isPersonalGOTY: true,
    isGOTY: false,
    order: 0,
  },
  // Decoy: the global GOTY name on a category that is not flagged.
  { id: 11, name: "Game of the Year", isGOTY: false, order: 1 },
  { id: 12, name: "Best Soundtrack", isGOTY: false, order: 2 },
  // Real GOTY: flagged, with a non-default name and order.
  { id: 13, name: "Community pick", isGOTY: true, order: 9 },
];

describe("isGlobalGOTYCategory", () => {
  it("reads only the flag", () => {
    expect(isGlobalGOTYCategory({ isGOTY: true })).toBe(true);
    expect(isGlobalGOTYCategory({ isGOTY: false })).toBe(false);
    expect(isGlobalGOTYCategory({})).toBe(false);
    expect(isGlobalGOTYCategory(null)).toBe(false);
    expect(isGlobalGOTYCategory(undefined)).toBe(false);
  });
});

describe("findGlobalGOTYCategory", () => {
  it("finds the flagged category, never the name or order", () => {
    expect(findGlobalGOTYCategory(categories)?.id).toBe(13);
  });

  it("returns null when no category is flagged", () => {
    const withoutGOTY = categories.filter((category) => !category.isGOTY);
    expect(findGlobalGOTYCategory(withoutGOTY)).toBeNull();
    expect(findGlobalGOTYCategory([])).toBeNull();
    expect(findGlobalGOTYCategory(null)).toBeNull();
    expect(findGlobalGOTYCategory(undefined)).toBeNull();
  });
});

describe("findGlobalGOTYCategoryItem", () => {
  it("joins ballot categories by id", () => {
    const ballotCategories = [
      { id: 10, order: 0, isPersonalGOTY: true },
      { id: 11, order: 1 },
      { id: 13, order: 9 },
    ];

    expect(
      findGlobalGOTYCategoryItem(
        ballotCategories,
        categories,
        (category) => category.id,
      )?.id,
    ).toBe(13);
  });

  it("joins votes by categoryId", () => {
    const votes = [
      { categoryId: 11, gameId: 100 },
      { categoryId: 13, gameId: 200 },
    ];

    expect(
      findGlobalGOTYCategoryItem(votes, categories, (vote) => vote.categoryId),
    ).toEqual({ categoryId: 13, gameId: 200 });
  });

  it("returns null when the item list has no GOTY entry", () => {
    expect(
      findGlobalGOTYCategoryItem([{ categoryId: 11 }], categories, (vote) => {
        return vote.categoryId;
      }),
    ).toBeNull();
    expect(findGlobalGOTYCategoryItem(null, categories, () => 13)).toBeNull();
    expect(
      findGlobalGOTYCategoryItem([{ id: 13 }], null, (item) => item.id),
    ).toBeNull();
  });
});

describe("sortByCategoryOrder", () => {
  it("sorts a copy by order without mutating the input", () => {
    const unsorted = [
      { id: 2, order: 2 },
      { id: 1, order: 0 },
      { id: 3, order: 1 },
    ];

    expect(
      sortByCategoryOrder(unsorted).map((category) => category.id),
    ).toEqual([1, 3, 2]);
    expect(unsorted.map((category) => category.id)).toEqual([2, 1, 3]);
  });

  it("treats a missing order as 0 and handles no input", () => {
    expect(
      sortByCategoryOrder([{ id: 1 }, { id: 2, order: -1 }]).map(
        (category) => category.id,
      ),
    ).toEqual([2, 1]);
    expect(sortByCategoryOrder(null)).toEqual([]);
  });
});
