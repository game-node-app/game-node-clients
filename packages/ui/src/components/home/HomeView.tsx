import type { ReactNode } from "react";

export interface HomeViewProps {
  /**
   * The platform's current home sections, rendered unchanged by the default.
   * The default keeps the search UI and the extra platform sections inside
   * this content, so the DOM stays exactly as each app composes it today.
   */
  children?: ReactNode;
  /**
   * Optional search UI for experiences that move it (the console home shows
   * it under the hero row). The default page already renders its search inside
   * `children`; this slot is only used when a replacement view asks for it.
   */
  search?: ReactNode;
  /**
   * Platform sections that an experience should keep after its own
   * composition (e.g. seasonal events, activity shelves). The default already
   * renders them inside `children`; the console home appends them after its
   * rows, releases and blog so those resources stay reachable without
   * duplicating the sections it replaces.
   */
  extras?: ReactNode;
}

/**
 * Default home composition. Web and mobile home pages pass their current
 * sections as children; the `console` experience provides its own `HomeView`
 * and recomposes them from the optional slots.
 */
const HomeView = ({ children, search, extras }: HomeViewProps) => (
  <>
    {children ?? (
      <>
        {search}
        {extras}
      </>
    )}
  </>
);

export { HomeView };
