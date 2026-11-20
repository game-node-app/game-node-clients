import { useScrollPosition } from "#@/components/general/hooks/useScrollPosition";
import { useState } from "react";

/**
 * Which category of an awards screen is open, and its neighbours in display
 * order. Shared by the ballot and the nominations screens so both pick the
 * active category, the previous/next one and the scroll reset the same way.
 *
 * Until a category is selected (or when the selected one disappears) the first
 * category is active.
 */
export function useAwardsCategoryNavigation<T extends { id: number }>(
  categories: T[],
) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);
  const [, scrollTo] = useScrollPosition();

  const selectedIndex = categories.findIndex(
    (category) => category.id === selectedCategoryId,
  );
  const activeIndex = categories.length === 0 ? -1 : Math.max(selectedIndex, 0);

  /** Opens a category at its top, not where the previous one was scrolled to. */
  const selectCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    scrollTo({ y: 0 });
  };

  return {
    activeCategory: categories[activeIndex],
    activeIndex,
    previousCategory: activeIndex > 0 ? categories[activeIndex - 1] : undefined,
    nextCategory: activeIndex >= 0 ? categories[activeIndex + 1] : undefined,
    selectCategory,
  };
}
