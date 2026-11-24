"use no memo";
import { IonRouterContext, NavContext } from "@ionic/react";
import {
  cloneElement,
  type ContextType,
  type ReactElement,
  type ReactNode,
  useContext,
  useState,
} from "react";
import {
  __RouterContext as RouterContext,
  matchPath,
  type RouteComponentProps,
  type RouteProps,
} from "react-router";

type RouterContextValue = ContextType<typeof RouterContext>;

interface Snapshot {
  router: RouterContextValue;
  ionRouter: ContextType<typeof IonRouterContext>;
  nav: ContextType<typeof NavContext>;
  children: ReactNode;
}

/**
 * Whether the view's own route (`computedMatch`, frozen by Ionic's
 * StackManager) still matches the current location.
 */
function isViewActive(router: RouterContextValue | undefined) {
  const { location, match } = router ?? {};
  if (!location || !match?.path) return true;
  const current = matchPath(location.pathname, {
    path: match.path,
    exact: match.isExact,
  });
  return current?.url === match.url;
}

/**
 * Ionic keeps every page of every tab stack mounted, and the router contexts
 * (react-router's location, `useIonRouter().routeInfo`, `NavContext`) are
 * global: without this boundary each navigation re-renders all of those hidden
 * pages, and they read the *new* route's pathname and query (which also made
 * them write their scroll position under the wrong path).
 *
 * While the view's route does not match the current location, the subtree
 * keeps the contexts it last saw as active and the same element, so React
 * bails out of it entirely. Data updates (React Query, i18n, theme) still
 * re-render it as usual.
 */
export function FreezeWhenInactive({ children }: { children: ReactNode }) {
  const router = useContext(RouterContext);
  const ionRouter = useContext(IonRouterContext);
  const nav = useContext(NavContext);
  const current: Snapshot = { router, ionRouter, nav, children };
  const [frozen, setFrozen] = useState(current);
  const active = isViewActive(router);

  if (
    active &&
    (frozen.router !== router ||
      frozen.ionRouter !== ionRouter ||
      frozen.nav !== nav ||
      frozen.children !== children)
  ) {
    // Remember what the view saw last while on screen (derived state: React
    // re-renders this component right away, before its children).
    setFrozen(current);
  }
  const shown = active ? current : frozen;

  return (
    <RouterContext.Provider value={shown.router}>
      <NavContext.Provider value={shown.nav}>
        <IonRouterContext.Provider value={shown.ionRouter}>
          {shown.children}
        </IonRouterContext.Provider>
      </NavContext.Provider>
    </RouterContext.Provider>
  );
}

/**
 * Wraps a `<Route render>` element so its page freezes while hidden.
 * The element stays a `Route`, which `IonRouterOutlet` requires.
 * @see FreezeWhenInactive
 */
export function freezeInactiveView(
  route: ReactElement<RouteProps>,
): ReactElement<RouteProps> {
  const render = route.props.render;
  if (!render) return route;
  return cloneElement(route, {
    render: (props: RouteComponentProps) => (
      <FreezeWhenInactive>{render(props)}</FreezeWhenInactive>
    ),
  });
}
