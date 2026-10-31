import { AppPage } from "@/components/general/AppPage.tsx";
import LibraryViewFab from "@/components/library/fab/LibraryViewFab";
import { LibraryViewRefresher } from "@/components/library/LibraryViewRefresher.tsx";
import { useIonRouter } from "@ionic/react";
import {
  LibraryView,
  LibraryViewLayout,
  useUserId,
  useUserProfile,
} from "@repo/ui";
import { SessionAuth } from "@repo/ui";

interface Props {
  userId?: string;
}

const LibraryPage = (props: Props) => {
  const ownUserId = useUserId();
  const targetUserId = props.userId ?? ownUserId;

  useIonRouter();

  useUserProfile(targetUserId);

  const isOwnLibrary = targetUserId === ownUserId;

  return (
    <AppPage
      withMenuButton
      withSearch
      contentProps={{
        fixedSlotPlacement: "before",
      }}
    >
      <SessionAuth
        requireAuth={props.userId == undefined || props.userId === "undefined"}
      >
        <LibraryViewRefresher userId={targetUserId!} />
        {isOwnLibrary && <LibraryViewFab />}
        <LibraryViewLayout userId={targetUserId}>
          <LibraryView libraryUserId={targetUserId!} />
        </LibraryViewLayout>
      </SessionAuth>
    </AppPage>
  );
};

export default LibraryPage;
