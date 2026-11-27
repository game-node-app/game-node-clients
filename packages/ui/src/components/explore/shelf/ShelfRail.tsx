import { ActionIcon } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { PropsWithChildren, useEffect, useRef, useState } from "react";

// touch screens swipe; only a mouse or trackpad needs the buttons
const ARROW_CLASS =
  "absolute top-1/2 z-10 hidden -translate-y-1/2 shadow-md [@media(pointer:fine)]:flex";

/** Horizontally scrolling row of covers, with buttons for pointer users. */
const ShelfRail = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const updateEdges = () => {
    const rail = ref.current;
    if (!rail) return;
    setHasPrevious(rail.scrollLeft > 1);
    setHasNext(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 1);
  };

  // after every render, since new covers change the scrollable width
  useEffect(updateEdges);

  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const scroll = (direction: 1 | -1) => {
    const rail = ref.current;
    rail?.scrollBy({
      left: direction * rail.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <div className={"relative w-full"}>
      <div
        ref={ref}
        onScroll={updateEdges}
        className={
          "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        }
      >
        {children}
      </div>
      {hasPrevious && (
        <ActionIcon
          variant={"default"}
          radius={"xl"}
          size={"lg"}
          className={`${ARROW_CLASS} left-1`}
          aria-label={t("explore.sections.scrollPrevious")}
          onClick={() => scroll(-1)}
        >
          <IconChevronLeft size={20} />
        </ActionIcon>
      )}
      {hasNext && (
        <ActionIcon
          variant={"default"}
          radius={"xl"}
          size={"lg"}
          className={`${ARROW_CLASS} right-1`}
          aria-label={t("explore.sections.scrollNext")}
          onClick={() => scroll(1)}
        >
          <IconChevronRight size={20} />
        </ActionIcon>
      )}
    </div>
  );
};

export { ShelfRail };
