import { useOnMobile } from "#@/components";
import { cn } from "#@/util";
import { Scroller, Tabs } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { CollectionEntry } from "@repo/wrapper/server";
import { useEffect, useRef } from "react";

interface Props {
  status: CollectionEntry.status;
  onStatusChange: (status: CollectionEntry.status) => void;
}

const STATUSES: { value: CollectionEntry.status; labelKey: string }[] = [
  {
    value: CollectionEntry.status.PLAYING,
    labelKey: "collectionEntry.statuses.playing",
  },
  {
    value: CollectionEntry.status.FINISHED,
    labelKey: "collectionEntry.statuses.finished",
  },
  {
    value: CollectionEntry.status.PLANNED,
    labelKey: "collectionEntry.statuses.planned",
  },
  {
    value: CollectionEntry.status.DROPPED,
    labelKey: "collectionEntry.statuses.dropped",
  },
  {
    value: CollectionEntry.status.ONGOING,
    labelKey: "collectionEntry.statuses.ongoing",
  },
];

const LibraryViewTabs = ({ status, onStatusChange }: Props) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const listRef = useRef<HTMLDivElement>(null);

  // Keep the active chip visible when the row is wider than the screen.
  useEffect(() => {
    if (!onMobile) return;
    const active = listRef.current?.querySelector<HTMLElement>(
      "[data-active='true']",
    );
    active?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: "smooth",
    });
  }, [status, onMobile]);

  return (
    <Tabs
      value={status}
      onChange={(v) => onStatusChange(v as CollectionEntry.status)}
      // Mobile: filled chips (selected = brand), the same language as the tab bar.
      // The outlined "folder" tabs need a full-width row, which overflows on a phone.
      variant={onMobile ? "pills" : "outline"}
      radius={onMobile ? "xl" : "md"}
    >
      <Tabs.List
        ref={listRef}
        className={cn(
          "flex-nowrap overflow-x-auto",
          onMobile && "gap-2 before:hidden",
        )}
      >
        <Scroller>
          {STATUSES.map(({ value, labelKey }) => (
            <Tabs.Tab
              key={value}
              value={value}
              className={cn(
                onMobile &&
                  "shrink-0 px-4 h-9 text-sm font-medium border border-[#2a2a2a] bg-[#161616] data-[active=true]:border-transparent",
              )}
            >
              {t(labelKey as never)}
            </Tabs.Tab>
          ))}
        </Scroller>
      </Tabs.List>
    </Tabs>
  );
};

export { LibraryViewTabs };
