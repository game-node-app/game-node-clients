import { PresenterRegistry, usePresenter } from "#@/presenters";
import React, { ComponentProps, ComponentType } from "react";

export function buildPresenterFallback<K extends keyof PresenterRegistry>(
  name: K,
  Fallback: ComponentType<ComponentProps<PresenterRegistry[K]>>,
) {
  const PresenterFallback = (props: ComponentProps<PresenterRegistry[K]>) => {
    const Presenter = usePresenter(name);
    // @ts-expect-error - this works, but typing it is annoying
    return Presenter ? <Presenter {...props} /> : <Fallback {...props} />;
  };

  PresenterFallback.displayName = `PresenterFallback(${name})`;

  return PresenterFallback;
}
