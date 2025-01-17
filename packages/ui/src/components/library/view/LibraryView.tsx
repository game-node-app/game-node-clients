import React, { PropsWithChildren } from "react";
import { LibraryViewSidebar } from "#@/components/library/view/sidebar/LibraryViewSidebar";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { Flex, Grid, Stack } from "@mantine/core";
import { LibraryViewCollectionsSelect } from "#@/components/library/view/sidebar/LibraryViewCollectionsSelect";
import { useRouter } from "#@/util";

interface ILibraryViewProps extends PropsWithChildren {
  userId: string | undefined;
  collectionId: string | null;
  onChange: (collectionId: string | null) => void;
}

/**
 * LibraryView should be used in any page that renders under the /library route.
 * It provides a sidebar on desktop and a top navigation on mobile.
 * @param children - The main content to render (e.g. a collection entries listing).
 * @param userId
 * @param collectionSelectProps
 * @constructor
 */
const LibraryView = ({
  children,
  userId,
  collectionId,
  onChange,
}: ILibraryViewProps) => {
  const onMobile = useOnMobile();

  return (
    <Stack w={"100%"} h={"100%"}>
      {onMobile && (
        <Flex w={"100%"} justify={"center"}>
          <LibraryViewCollectionsSelect
            userId={userId}
            value={collectionId}
            onChange={(value) => {
              onChange(value);
            }}
            onClear={() => {
              onChange(null);
            }}
          />
        </Flex>
      )}
      <Grid columns={12} w={"100%"} h={"100%"}>
        <Grid.Col
          span={{ base: 0, lg: 3 }}
          display={onMobile ? "none" : undefined}
        >
          <LibraryViewSidebar userId={userId} />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 9 }} h={"100%"}>
          {children}
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export { LibraryView };
