import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters.ts";
import {
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { Stack } from "@mantine/core";
import {
  PostsFeed,
  type PostsFeedChildrenProps,
  PostsFeedLayout,
  PostsFeedTabValue,
} from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

const PostsPage = () => {
  const { t } = useTranslation();
  const params = useSearchParameters();
  const postId = params.get("postId") as string | undefined;

  const contentRef =
    useRef<
      import("react").ComponentRef<typeof import("@ionic/react").IonContent>
    >(null);
  const [currentTab, setCurrentTab] = useState<PostsFeedTabValue>("all");

  const queryClient = useQueryClient();

  return (
    <AppPage
      title={t("navigation.posts")}
      withSearch
      contentProps={{
        ref: contentRef,
      }}
    >
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          await queryClient.invalidateQueries({
            queryKey: ["posts", "feed"],
          });
          evt.detail.complete();
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      <Stack className={"w-full my-4"}>
        <PostsFeedLayout currentTab={currentTab} onChange={setCurrentTab}>
          <PostsFeed criteria={currentTab} targetedPostId={postId}>
            {({ fetchNextPage, hasNextPage }: PostsFeedChildrenProps) => (
              <IonInfiniteScroll
                disabled={!hasNextPage}
                onIonInfinite={async (evt) => {
                  await fetchNextPage();
                  await evt.target.complete();
                }}
              >
                <IonInfiniteScrollContent />
              </IonInfiniteScroll>
            )}
          </PostsFeed>
        </PostsFeedLayout>
      </Stack>
    </AppPage>
  );
};

export { PostsPage };
