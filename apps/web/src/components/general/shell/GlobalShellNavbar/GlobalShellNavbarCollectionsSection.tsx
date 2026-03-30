import React from "react";
import { Button, ScrollArea, Stack, Text } from "@mantine/core";
import { TextLink, useUserId, useUserLibrary } from "@repo/ui";

interface Props {}

const GlobalShellNavbarCollectionsSection = () => {
  const userId = useUserId();
  const { data: library } = useUserLibrary(userId);

  const collections = library?.collections || [];

  const featuredCollections = collections.filter(
    (collection) => collection.isFeatured,
  );
  const nonFeaturedCollections = collections.filter(
    (collection) => !collection.isFeatured,
  );

  return (
    <Stack className={"w-full"}>
      <Button fullWidth>New Collection</Button>
      <Text className={"text-sm text-dimmed"}>Featured Collections</Text>
      <ScrollArea.Autosize mah={200}>
        <Stack className={"flex flex-col gap-1"}>
          {featuredCollections.map((collection) => (
            <TextLink
              key={collection.id}
              href={`/library/${userId}/collection/${collection.id}`}
              className={
                "no-underline hover:bg-paper-7 h-9 flex items-center ps-3"
              }
            >
              {collection.name}
            </TextLink>
          ))}
        </Stack>
      </ScrollArea.Autosize>
      <Text className={"text-sm text-dimmed"}>All Collections</Text>
      <ScrollArea.Autosize mah={200}>
        <Stack className={"flex flex-col gap-1"}>
          {nonFeaturedCollections.map((collection) => (
            <TextLink
              key={collection.id}
              href={`/library/${userId}/collection/${collection.id}`}
              className={
                "no-underline hover:bg-paper-7 h-9 flex items-center ps-3"
              }
            >
              {collection.name}
            </TextLink>
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Stack>
  );
};

export { GlobalShellNavbarCollectionsSection };
