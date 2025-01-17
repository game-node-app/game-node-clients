import React, { HTMLProps } from "react";

export interface RoutingComponent extends HTMLProps<HTMLAnchorElement> {
  href: string;
}

interface RoutingManagerProps {
  push: (route: string) => Promise<unknown> | unknown;
}

export let useRouter: () => RoutingManagerProps = () => {
  throw new Error(
    "A routing manager must be set. Call `setRoutingManager` at the project's root.",
  );
};

export let Link: React.FC<RoutingComponent> = () => {
  throw new Error(
    "A routing component must be set. Call `setRoutingComponent` at the project's root.",
  );
};

export function setRoutingComponent(component: React.FC<RoutingComponent>) {
  console.log("Routing component set to: ", component);
  Link = component;
}

export function setRoutingManager(routerHook: () => RoutingManagerProps) {
  console.log("Routing manager set to: ", routerHook);
  useRouter = routerHook;
}
