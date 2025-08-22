import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  ComponentPropsWithoutRef,
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
const ScrollableIonContent = forwardRef<
  HTMLIonContentElement,
  ComponentPropsWithoutRef<typeof IonContent>
>((props, ref) => {
  const ionRouter = useIonRouter();
  const localRef = useRef<HTMLIonContentElement>(null);
  const pathname = ionRouter.routeInfo.pathname;

  // Merge localRef with forwarded ref
  useImperativeHandle(ref, () => localRef.current as HTMLIonContentElement, []);

  const onScrollChange = useDebouncedCallback(
    (scrollPosition: ScrollPosition) => {
      console.log("scroll position: ", scrollPosition);
      SCROLL_POSITIONS.set(pathname, scrollPosition);
    },
    300,
  );

  useEffect(() => {
    const currentScrollPosition = SCROLL_POSITIONS.get(pathname);
    if (currentScrollPosition) {
      console.log("Restoring scroll position: ", currentScrollPosition);
      localRef.current?.scrollToPoint(
        currentScrollPosition.x,
        currentScrollPosition.y,
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
});

ScrollableIonContent.displayName = "ScrollableIonContent";

export { ScrollableIonContent };
