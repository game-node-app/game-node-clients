import { Box, Stack } from "@mantine/core";
import React, { useMemo, useState } from "react";
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import { ExploreGamesPageView } from "@/components/explore/ExploreGamesPageView";
import { ExplorePostsPageView } from "@/components/explore/ExplorePostsPageView";
import { ExploreActivityPageView } from "@/components/explore/ExploreActivityPageView.tsx";
import "@/components/explore/explore.css";
import { GamePostEditor, Modal } from "@repo/ui";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { IconMessage2Share } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

type ExploreSegment = "games" | "posts" | "activity";

const ExplorePage = () => {
  const router = useIonRouter();
  const pathname = router.routeInfo.pathname;
  const isInTab = pathname.split("/").length === 2;

  const [createPostModalOpened, createPostModalUtils] = useDisclosure();

  const [selectedSegment, setSelectedSegment] =
    useState<ExploreSegment>("games");

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonSegment
            value={selectedSegment}
            onIonChange={(evt) =>
              setSelectedSegment(evt.detail.value as unknown as ExploreSegment)
            }
          >
            <IonSegmentButton value="games">
              <IonLabel>Games</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="posts">
              <IonLabel>Posts</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="activity">
              <IonLabel>Activity</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent className={"ion-padding"}>
        <IonFab
          slot="fixed"
          horizontal="end"
          vertical="bottom"
          className={"me-2 mb-2 hidden data-[active=true]:block"}
          data-active={selectedSegment === "posts" ? "true" : "false"}
        >
          <Modal
            opened={createPostModalOpened}
            onClose={createPostModalUtils.close}
            title={"Publish post"}
            breakpoints={[0.5, 0.75, 0.85, 1]}
            initialBreakpoint={1}
          >
            <SessionAuth>
              <GamePostEditor
                editorProps={{
                  mih: "65vh",
                }}
                onPublish={createPostModalUtils.close}
              />
            </SessionAuth>
          </Modal>
          <IonFabButton
            color={"primary"}
            onClick={() => {
              createPostModalUtils.open();
            }}
          >
            <IconMessage2Share />
          </IonFabButton>
        </IonFab>
        <Stack className={"min-h-screen my-4"}>
          <Box
            className={
              "hidden data-[active=true]:block explore-segment-content"
            }
            data-active={selectedSegment === "games" ? "true" : "false"}
          >
            <ExploreGamesPageView />
          </Box>
          <Box
            className={
              "hidden data-[active=true]:block explore-segment-content"
            }
            data-active={selectedSegment === "posts" ? "true" : "false"}
          >
            <ExplorePostsPageView />
          </Box>
          <Box
            className={
              "hidden data-[active=true]:block explore-segment-content"
            }
            data-active={selectedSegment === "activity" ? "true" : "false"}
          >
            <ExploreActivityPageView />
          </Box>
        </Stack>
      </IonContent>
    </IonPage>
  );
};

export default ExplorePage;
