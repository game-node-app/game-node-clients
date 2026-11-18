type IonMenuElement = HTMLElement & {
  close: (animated?: boolean) => Promise<boolean>;
  isOpen: () => Promise<boolean>;
};

const MAX_ATTEMPTS = 10;
const RETRY_DELAY_MS = 80;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Opens the side menu (`Tabs.tsx`), asking the `ion-menu` element directly (see `closeMainMenu`). */
export async function openMainMenu(): Promise<boolean> {
  const menu = document.querySelector<
    HTMLElement & { open: (animated?: boolean) => Promise<boolean> }
  >("ion-menu");
  if (!menu) return false;
  return menu.open();
}

/**
 * Closes the side menu (`Tabs.tsx`). It asks the `ion-menu` element itself: `menuController` from
 * `@ionic/core/components` keeps its own registry of menus, and the one `IonMenu` registers into is
 * not necessarily that instance, in which case `menuController.close("main-menu")` silently does
 * nothing and the menu stays open after a tap on one of its items.
 *
 * `ion-menu.close()` also resolves `false` without doing anything while the menu is mid-animation
 * (e.g. the tap landed during the open/swipe animation, or the route transition just started), so
 * it is retried until the menu actually reports closed.
 */
export async function closeMainMenu(): Promise<boolean> {
  const menu = document.querySelector<IonMenuElement>("ion-menu");
  if (!menu) return false;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (!(await menu.isOpen())) return true;
    await menu.close();
    if (!(await menu.isOpen())) return true;
    await wait(RETRY_DELAY_MS);
  }
  return false;
}
