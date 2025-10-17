import { HTMLProps } from "react";
import { buildPresenterComponent, useHooks } from "#@/context";

interface TransitionOptions {
  scroll?: boolean;
  shallow?: boolean;
  replace?: boolean;
}

export interface LinkComponentProps
  extends HTMLProps<HTMLAnchorElement>,
    TransitionOptions {
  href: string;
}

export interface RouterHookProps {
  pathname: string;
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
