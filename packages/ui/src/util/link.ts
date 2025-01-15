import React, { HTMLProps } from "react";

interface RoutingComponent extends HTMLProps<HTMLAnchorElement> {
  href: string;
}

interface RoutingManagerProps {
  push: (route: string) => Promise<void> | void;
}

export let useRouter: () => RoutingManagerProps;

export let Link: React.FC<RoutingComponent>;

export function setRoutingComponent(component: React.FC<RoutingComponent>) {
  console.log("Routing component set to: ", component);
  Link = component;
}

export function setRoutingManager(routerHook: () => RoutingManagerProps) {
  console.log("Routing manager set to: ", routerHook);
  useRouter = routerHook;
}
