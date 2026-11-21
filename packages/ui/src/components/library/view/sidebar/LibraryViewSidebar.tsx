import {
  CollectionCreateButton,
  useUserId,
  useUserLibrary,
} from "#@/components";
import { filterVisibleCollections } from "#@/components/library/util/filterVisibleCollections";
import { LibraryViewSidebarCollection } from "#@/components/library/view/sidebar/LibraryViewSidebarCollection.tsx";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { Link } from "#@/util";
import { Accordion, Button, Paper, Stack, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface ILibraryViewSidebarProps {
  userId: string | undefined;
}

const LibraryViewSidebar = ({ userId }: ILibraryViewSidebarProps) => {
  const { t } = useTranslation();
  const ownUserId = useUserId();
  const userProfileQuery = useUserProfile(userId);
  const username = userProfileQuery.data?.username;
  const isOwnLibrary = ownUserId != undefined && ownUserId === userId;
  const userLibraryQuery = useUserLibrary(userId);
  const hasFeatured = !!filterVisibleCollections(
    userLibraryQuery.data?.collections,
    isOwnLibrary,
  )?.some((collection) => collection.isFeatured);

  if (!userId) return null;

  return (
    <nav>
      <Paper
        className={
          "bg-[color-mix(in_srgb,var(--gn-dark-4)_20%,transparent)] p-5"
        }
      >
        <Stack className={"w-full"}>
          <Link href={`/library/${userId}`}>
            <Title size={"h5"}>
              {t("profile.titles.library", { username })}
            </Title>
          </Link>
          <Stack className={""}>
            <Accordion
              // Re-mount once the library loads so the open section matches what exists.
              key={hasFeatured ? "featured" : "all"}
              variant={"default"}
              defaultValue={hasFeatured ? "featured" : "all"}
            >
              <LibraryViewSidebarCollection userId={userId} type={"all"} />
              <LibraryViewSidebarCollection userId={userId} type={"featured"} />
            </Accordion>
          </Stack>
          {isOwnLibrary && (
            <Stack gap={"xs"}>
              <CollectionCreateButton fullWidth />
              <Link href={"/importer"} className={"w-full"}>
                <Button variant={"default"} fullWidth>
                  {t("library.buttons.importGames")}
                </Button>
              </Link>
            </Stack>
          )}
        </Stack>
      </Paper>
    </nav>
  );
};

export { LibraryViewSidebar };
