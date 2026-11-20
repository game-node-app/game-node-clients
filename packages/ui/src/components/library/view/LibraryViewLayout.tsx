import { LibraryViewSidebar } from "#@/components/library/view/sidebar/LibraryViewSidebar";
import { Grid, Stack } from "@mantine/core";
import { PropsWithChildren } from "react";

interface ILibraryViewProps extends PropsWithChildren {
  userId: string | undefined;
}

/**
 * LibraryViewLayout should be used in any page that renders under the /library route.
 * It provides a collections sidebar from the sm breakpoint up. On phones, collections
 * are reached through the app's own navigation (profile collections tab / collections page).
 * @param children - The main content to render (e.g. a collection entries listing).
 * @param userId
 * @constructor
 */
const LibraryViewLayout = ({ children, userId }: ILibraryViewProps) => {
  return (
    <Stack className={"w-full"} id={"library-view"}>
      <Grid columns={12} w={"100%"} h={"100%"}>
        {/* span 0 doesn't hide a Grid.Col in Mantine; it falls back to auto width and stacks */}
        <Grid.Col span={{ sm: 4, lg: 3 }} visibleFrom={"sm"}>
          <LibraryViewSidebar userId={userId} />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 8, lg: 9 }} h={"100%"}>
          {children}
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export { LibraryViewLayout };
