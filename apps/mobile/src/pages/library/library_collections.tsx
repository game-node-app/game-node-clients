import { AppPage } from "@/components/general/AppPage.tsx";
import { LibraryViewRefresher } from "@/components/library/LibraryViewRefresher";
import LibraryViewFab from "@/components/library/fab/LibraryViewFab";
import { Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  CollectionThumbnailCard,
  useUserId,
  useUserLibrary,
  useUserProfile,
} from "@repo/ui";

interface Props {
  userId: string;
}

const LibraryCollectionsPage = ({ userId }: Props) => {
  const { t } = useTranslation();
  const ownUserId = useUserId();
  const { data: library } = useUserLibrary(userId);
  const { data: profile } = useUserProfile(userId);
  const collections = library?.collections ?? [];

  const isOwnLibrary = userId === ownUserId;

  return (
    <AppPage withSearch contentProps={{ fixedSlotPlacement: "before" }}>
      <LibraryViewRefresher userId={userId} />
      {isOwnLibrary && <LibraryViewFab />}
      <Text className={"text-xl font-bold mb-5"}>
        {isOwnLibrary
          ? t("mobile.library.collectionsTitle")
          : t("mobile.library.collectionsTitleFor", {
              username: profile?.username ?? "",
            })}
      </Text>
      <Stack>
        {collections.map((collection) => (
          <CollectionThumbnailCard
            key={`${userId}-${collection.id}`}
            collectionId={collection.id}
          />
        ))}
      </Stack>
    </AppPage>
  );
};

export default LibraryCollectionsPage;