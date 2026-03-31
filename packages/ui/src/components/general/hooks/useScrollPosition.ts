import { useHooks } from "#@/context";
import { useWindowScroll } from "@mantine/hooks";

export interface ScrollPosition {
  x: number;
  y: number;
}

export interface ScrollToOptions extends Partial<ScrollPosition> {
  duration?: number;
}

type ScrollToFunction = (options: ScrollToOptions) => void;

export type UseScrollPositionReturn = [ScrollPosition, ScrollToFunction];

export function useScrollPosition(): UseScrollPositionReturn {
  const { useScrollPosition: override } = useHooks();
  /**
   * This default mantine hook only works on web platforms.
   */
  const [webScrollPosition, webScrollTo] = useWindowScroll();

  if (override !== undefined) {
    return override();
  }

  return [webScrollPosition, webScrollTo];
}
