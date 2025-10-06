import React from "react";
import { CollectionEntry } from "@repo/wrapper/server";
import { Tabs } from "@mantine/core";
import { useOnMobile } from "#@/components";

interface Props {
  status: CollectionEntry.status;
  onStatusChange: (status: CollectionEntry.status) => void;
}

const LibraryViewTabs = ({ status, onStatusChange }: Props) => {
  const onMobile = useOnMobile();
  return (
    <Tabs
      value={status}
      onChange={(v) => onStatusChange(v as CollectionEntry.status)}
      variant={"outline"}
      radius={"md"}
    >
      <Tabs.List grow={onMobile} className={"flex-nowrap"}>
        <Tabs.Tab value={CollectionEntry.status.PLAYING}>Playing</Tabs.Tab>
        <Tabs.Tab value={CollectionEntry.status.FINISHED}>Finished</Tabs.Tab>
        <Tabs.Tab value={CollectionEntry.status.PLANNED}>Planned</Tabs.Tab>
        <Tabs.Tab value={CollectionEntry.status.DROPPED}>Dropped</Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
};

export { LibraryViewTabs };
