import React, { HTMLProps } from "react";

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

export let useRouter: () => RouterHookProps = () => {
  throw new Error(
    "A routing manager must be set. Call `setRoutingManager` at the project's root.",
  );
};

export let Link: React.FC<LinkComponentProps> = () => {
  throw new Error(
    "A routing component must be set. Call `setRoutingComponent` at the project's root.",
  );
};

export function setLinkComponent(component: React.FC<LinkComponentProps>) {
  Link = component;
}

export function setRouterHook(routerHook: () => RouterHookProps) {
  useRouter = routerHook;
}
