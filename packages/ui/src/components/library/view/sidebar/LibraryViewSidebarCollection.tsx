import React, { useMemo } from "react";
import { useUserLibrary } from "#@/components";
import { Accordion, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { Link } from "#@/util";
import classes from "./library-view-sidebar.module.css";
import { useTranslation } from "@repo/locales";

interface Props {
  userId: string;
  type: "featured" | "all";
}

const LibraryViewSidebarCollection = ({ userId, type }: Props) => {
  const { t } = useTranslation();
  const userLibraryQuery = useUserLibrary(userId);

  const collections = useMemo(() => {
    return userLibraryQuery.data?.collections.filter((collection) => {
      if (type === "featured") {
        return collection.isFeatured;
      }

      return true;
    });
  }, [type, userLibraryQuery.data?.collections]);

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
