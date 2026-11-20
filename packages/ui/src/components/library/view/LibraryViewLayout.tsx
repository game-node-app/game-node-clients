import { CollectionCreateButton } from "#@/components/collection/form/CollectionCreateButton";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { LibraryViewCollectionsSelect } from "#@/components/library/view/sidebar/LibraryViewCollectionsSelect";
import { LibraryViewSidebar } from "#@/components/library/view/sidebar/LibraryViewSidebar";
import { useRouter } from "#@/util";
import { Grid, Group, Stack } from "@mantine/core";
import { PropsWithChildren } from "react";

interface ILibraryViewProps extends PropsWithChildren {
  userId: string | undefined;
  collectionId?: string | null;
}

/**
 * LibraryViewLayout should be used in any page that renders under the /library route.
 * It provides a sidebar on desktop and a top navigation on mobile.
 * @param children - The main content to render (e.g. a collection entries listing).
 * @param userId
 * @param collectionSelectProps
 * @constructor
 */
const LibraryViewLayout = ({
  children,
  userId,
  collectionId,
}: ILibraryViewProps) => {
  const router = useRouter();
  const onMobile = useOnMobile();
  const ownUserId = useUserId();
  const isOwnLibrary = ownUserId != undefined && ownUserId === userId;

  return (
    <Stack className={"w-full"} id={"library-view"}>
      {onMobile && (
        <Group w={"100%"} wrap={"nowrap"}>
          <LibraryViewCollectionsSelect
            className={"flex-1 min-w-0"}
            userId={userId}
            value={collectionId}
            onChange={(value) => {
              // User is already viewing a collection
              const isInCollection = collectionId != undefined;
              if (value) {
                router.push(`/library/${userId}/collection/${value}`, {
                  replace: isInCollection,
                  shallow: true,
                });
                return;
              }
              router.push(`/library/${userId}`);
            }}
            onClear={() => {
              router.push(`/library/${userId}`);
            }}
          />
          {isOwnLibrary && <CollectionCreateButton variant={"light"} />}
        </Group>
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

export { LibraryViewLayout };