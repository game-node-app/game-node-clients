import { useOnMobile } from "#@/components";
import { Scroller, Tabs } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { CollectionEntry } from "@repo/wrapper/server";

interface Props {
  status: CollectionEntry.status;
  onStatusChange: (status: CollectionEntry.status) => void;
}

const LibraryViewTabs = ({ status, onStatusChange }: Props) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  return (
    <Tabs
      value={status}
      onChange={(v) => onStatusChange(v as CollectionEntry.status)}
      variant={"outline"}
      radius={"md"}
    >
      <Tabs.List grow={onMobile} className={"flex-nowrap overflow-x-auto"}>
        <Scroller>
          <Tabs.Tab value={CollectionEntry.status.PLAYING}>
            {t("collectionEntry.statuses.playing")}
          </Tabs.Tab>
          <Tabs.Tab value={CollectionEntry.status.FINISHED}>
            {t("collectionEntry.statuses.finished")}
          </Tabs.Tab>
          <Tabs.Tab value={CollectionEntry.status.PLANNED}>
            {t("collectionEntry.statuses.planned")}
          </Tabs.Tab>
          <Tabs.Tab value={CollectionEntry.status.DROPPED}>
            {t("collectionEntry.statuses.dropped")}
          </Tabs.Tab>
          <Tabs.Tab value={CollectionEntry.status.ONGOING}>
            {t("collectionEntry.statuses.ongoing")}
          </Tabs.Tab>
        </Scroller>
      </Tabs.List>
    </Tabs>
  );
};

export { LibraryViewTabs };