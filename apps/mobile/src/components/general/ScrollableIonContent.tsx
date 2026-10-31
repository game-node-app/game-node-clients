import {
  clearScrollPosition,
  setScrollPosition,
  useScrollPositionForPathname,
  useScrollToForPathname,
} from "@/components/general/hooks/useIonScrollPosition";
import { IonContent, useIonRouter } from "@ionic/react";
import { useDebouncedCallback } from "@mantine/hooks";
import { ScrollPosition } from "@repo/ui";
import { ComponentProps, useEffect, useImperativeHandle, useRef } from "react";

/**
 * A {@link IonContent} wrapper that automatically persists and restores scroll position when navigating.
 * This is necessary due to a bug in Ionic's part:
 * https://github.com/ionic-team/ionic-framework/issues/29578
 */
const ScrollableIonContent = (props: ComponentProps<typeof IonContent>) => {
  const ionRouter = useIonRouter();
  const localRef =
    useRef<
      import("react").ComponentRef<typeof import("@ionic/react").IonContent>
    >(null);
  const pathname = ionRouter.routeInfo.pathname;

  const storedScrollPosition = useScrollPositionForPathname(pathname);
  const scrollToCommand = useScrollToForPathname(pathname);

  const isRestoringRef = useRef(false);
  const restoredPathRef = useRef<string | null>(null);

  // Merge localRef with forwarded ref
  useImperativeHandle(
    props.ref,
    () =>
      localRef.current as import("react").ComponentRef<
        typeof import("@ionic/react").IonContent
      >,
    [],
  );

  const onScrollChange = useDebouncedCallback(
    (scrollPosition: ScrollPosition) => {
      if (isRestoringRef.current) return;
      console.log(`scroll position for ${pathname}: `, scrollPosition);
      setScrollPosition(pathname, scrollPosition);
    },
    300,
  );

  useEffect(() => {
    if (restoredPathRef.current !== pathname) {
      restoredPathRef.current = null;
    }

    const { x, y } = storedScrollPosition;
    if (x === 0 && y === 0) return;
    if (restoredPathRef.current === pathname) return;

    let raf1 = 0;
    let raf2 = 0;
    isRestoringRef.current = true;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        localRef.current?.scrollToPoint(x, y, 0);
        clearScrollPosition(pathname);
        restoredPathRef.current = pathname;

        requestAnimationFrame(() => {
          isRestoringRef.current = false;
        });
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      isRestoringRef.current = false;
    };
  }, [pathname, storedScrollPosition]);

  // respond to external scrollTo commands
  useEffect(() => {
    const scrollTo = scrollToCommand?.scrollTo;

    if (!scrollTo) return;

    isRestoringRef.current = true;
    localRef.current?.scrollToPoint(
      scrollTo.x,
      scrollTo.y,
      scrollTo.duration ?? 0,
    );

    scrollToCommand.clear();

    requestAnimationFrame(() => {
      isRestoringRef.current = false;
    });
  }, [scrollToCommand]);

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
