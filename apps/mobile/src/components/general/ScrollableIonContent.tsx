import React, {
  ComponentProps,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { IonContent, useIonRouter } from "@ionic/react";
import { useDebouncedCallback } from "@mantine/hooks";

interface ScrollPosition {
  x: number;
  y: number;
}

const SCROLL_POSITIONS = new Map<string, ScrollPosition>();

/**
 * A {@link IonContent} wrapper that automatically persists and restores scroll position when navigating.
 * This is necessary due to a bug in Ionic's part:
 * https://github.com/ionic-team/ionic-framework/issues/29578
 */
const ScrollableIonContent = (props: ComponentProps<typeof IonContent>) => {
  const ionRouter = useIonRouter();
  const localRef = useRef<HTMLIonContentElement>(null);
  const pathname = ionRouter.routeInfo.pathname;

  // Merge localRef with forwarded ref
  useImperativeHandle(
    props.ref,
    () => localRef.current as HTMLIonContentElement,
    [],
  );

  const onScrollChange = useDebouncedCallback(
    (scrollPosition: ScrollPosition) => {
      SCROLL_POSITIONS.set(pathname, scrollPosition);
    },
    300,
  );

  useEffect(() => {
    const storedScrollPosition = SCROLL_POSITIONS.get(pathname);
    if (storedScrollPosition) {
      console.log(
        `Restoring scroll position for ${pathname}: `,
        storedScrollPosition,
      );
      localRef.current?.scrollToPoint(
        storedScrollPosition.x,
        storedScrollPosition.y,
      );
      SCROLL_POSITIONS.delete(pathname);
    }
  }, [pathname]);

  return (
    <IonContent
      {...props}
      ref={localRef}
      scrollEvents={true}
      onIonScroll={(evt) =>
        onScrollChange({
          x: evt.detail.currentX,
          y: evt.detail.currentY,
        })
      }
    />
  );
};

export { ScrollableIonContent };
