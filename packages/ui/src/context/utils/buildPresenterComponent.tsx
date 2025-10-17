import { UIPresenterRegistry, usePresenter } from "#@/context";
import React, { ComponentProps, ComponentType } from "react";

/**
 * Returns a presenter component that renders a fallback if the presenter is not found. <br>
 * @apiNote Presenters are always optional, so if a mandatory component is every needed (e.g. a Link), create a
 * fallback with the same props and throw an error on render.
 * @param name
 * @param Fallback
 */
export function buildPresenterComponent<K extends keyof UIPresenterRegistry>(
  name: K,
  Fallback: ComponentType<ComponentProps<UIPresenterRegistry[K]>>,
) {
  const PresenterFallback = (props: ComponentProps<UIPresenterRegistry[K]>) => {
    const Presenter = usePresenter(name);
    // @ts-expect-error - Presenter is optional
    // eslint-disable-next-line react-hooks/static-components
    return Presenter ? <Presenter {...props} /> : <Fallback {...props} />;
  };

  PresenterFallback.displayName = `Presenter(${name})`;

  return PresenterFallback;
}
