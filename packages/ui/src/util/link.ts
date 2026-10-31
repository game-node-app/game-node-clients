import { HTMLProps } from "react";
import { buildPresenterComponent, useHooks } from "#@/context";

interface TransitionOptions {
  scroll?: boolean;
  shallow?: boolean;
  replace?: boolean;
  /** The route is complete (e.g. a sign-in return target); routers must not add a tab prefix. */
  absolute?: boolean;
}

export interface LinkComponentProps
  extends HTMLProps<HTMLAnchorElement>,
    TransitionOptions {
  href: string;
}

export interface RouterHookProps {
  pathname: string;
  /** Full current path as the router sees it (without locale); defaults to `pathname`. */
  asPath?: string;
  back: () => void;
  push: (route: string, options?: TransitionOptions) => Promise<void>;
  query: URLSearchParams;
}

const MandatoryLinkFallback = () => {
  throw new Error("A Link component must be set in UIProvider.");
};

export function useRouter() {
  const { useRouter: impl } = useHooks();

  return impl();
}

export const Link = buildPresenterComponent("Link", MandatoryLinkFallback);
