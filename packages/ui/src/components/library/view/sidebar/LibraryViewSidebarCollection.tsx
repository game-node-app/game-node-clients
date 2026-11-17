import { useUserId, useUserLibrary } from "#@/components";
import { filterVisibleCollections } from "#@/components/library/util/filterVisibleCollections";
import { Link } from "#@/util";
import { Accordion, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useMemo } from "react";
import classes from "./library-view-sidebar.module.css";

interface Props {
  userId: string;
  type: "featured" | "all";
}

const LibraryViewSidebarCollection = ({ userId, type }: Props) => {
  const { t } = useTranslation();
  const ownUserId = useUserId();
  const userLibraryQuery = useUserLibrary(userId);

  const collections = useMemo(() => {
    const visibleCollections = filterVisibleCollections(
      userLibraryQuery.data?.collections,
      ownUserId != undefined && ownUserId === userId,
    );

    return visibleCollections?.filter((collection) => {
      if (type === "featured") {
        return collection.isFeatured;
      }

      return true;
    });
  }, [ownUserId, type, userId, userLibraryQuery.data?.collections]);

  const renderedCollections = useMemo(() => {
    return collections?.map((collection) => {
      return (
        <Link
          className={classes.sidebarLink}
          key={collection.id}
          href={`/library/${userId}/collection/${collection.id}`}
        >
          <Group>
            <Text>{collection.name}</Text>
          </Group>
        </Link>
      );
    });
  }, [collections, userId]);

  return (
    <Accordion.Item value={type} className={"!border-b-0"}>
      <Accordion.Control
        disabled={collections == undefined || collections.length === 0}
      >
        {type === "featured"
          ? t("collection.titles.featured")
          : t("collection.titles.all")}
      </Accordion.Control>
      <Accordion.Panel>
        <ScrollArea h={200}>
          <Stack gap={"xs"}>{renderedCollections}</Stack>
        </ScrollArea>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export { LibraryViewSidebarCollection };
