import { AppPage } from "@/components/general/AppPage.tsx";
import { SignedOutTabPlaceholder } from "@/components/general/SignedOutTabPlaceholder.tsx";
import { useTranslation } from "@repo/locales";
import LibraryViewFab from "@/components/library/fab/LibraryViewFab";
import { LibraryViewRefresher } from "@/components/library/LibraryViewRefresher.tsx";
import { useIonRouter } from "@ionic/react";
import {
  LibraryView,
  LibraryViewLayout,
  useUserId,
  useUserProfile,
} from "@repo/ui";

interface Props {
  userId?: string;
}

const LibraryPage = (props: Props) => {
  const { t } = useTranslation();
  const ownUserId = useUserId();
  const targetUserId = props.userId ?? ownUserId;

  useIonRouter();

  useUserProfile(targetUserId);

  const isOwnLibrary = targetUserId === ownUserId;

  return (
    <AppPage
      title={t("navigation.library")}
      withMenuButton
      withSearch
      contentProps={{
        fixedSlotPlacement: "before",
      }}
    >
      <SignedOutTabPlaceholder
        screen={"library"}
        requireAuth={props.userId == undefined || props.userId === "undefined"}
      >
        <LibraryViewRefresher userId={targetUserId!} />
        {isOwnLibrary && <LibraryViewFab />}
        <LibraryViewLayout userId={targetUserId}>
          <LibraryView libraryUserId={targetUserId!} />
        </LibraryViewLayout>
      </SignedOutTabPlaceholder>
    </AppPage>
  );
};

export default LibraryPage;
