import {
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonRouter,
} from "@ionic/react";
import React, { useRef, useState } from "react";
import { Container, Stack } from "@mantine/core";
import useUserId from "@/components/auth/hooks/useUserId";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { useQueryClient } from "@tanstack/react-query";
import {
  DetailsBox,
  HomeFeed,
  InfiniteLoaderProps,
  RecommendationCarousel,
  SearchBar,
  TrendingReviewCarousel,
} from "@repo/ui";
import { HomeFab } from "@/components/home/HomeFab.tsx";

const HomePage = () => {
  const router = useIonRouter();

  const contentRef = useRef<HTMLIonContentElement>(null);

  const queryClient = useQueryClient();

  const [query, setQuery] = useState<string>("");

  const userId = useUserId();
  return (
    <IonPage>
      <IonContent ref={contentRef}>
        <IonRefresher
          slot={"fixed"}
          onIonRefresh={async (evt) => {
            const promises: Promise<unknown>[] = [];
            promises.push(
              queryClient.invalidateQueries({
                queryKey: ["recommendation"],
              }),
            );
            promises.push(
              queryClient.invalidateQueries({
                queryKey: ["activities"],
              }),
            );
            promises.push(
              queryClient.invalidateQueries({
                queryKey: ["comments"],
              }),
            );
            promises.push(
              queryClient.invalidateQueries({
                queryKey: ["posts", "feed"],
              }),
            );

            await Promise.all(promises);

            evt.detail.complete();
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        <HomeFab contentRef={contentRef} />

        <Container fluid className={"w-full my-4"}>
          <form
            onSubmit={(evt) => {
              evt.preventDefault();
              router.push(getTabAwareHref(`/search_results?q=${query}`));
            }}
          >
            <SearchBar
              className={"my-3"}
              label={"Search for games"}
              onChange={(evt) => setQuery(evt.currentTarget.value ?? "")}
              onBlur={() => {
                if (query.length >= 3) {
                  router.push(getTabAwareHref(`/search_results?q=${query}`));
                }
              }}
              value={query}
            />
          </form>
          <Stack className={"w-full gap-8"}>
            {userId && (
              <RecommendationCarousel
                criteria={"finished"}
                stackProps={{
                  className: "",
                }}
              />
            )}
            <TrendingReviewCarousel />

            {userId && (
              <>
                <RecommendationCarousel
                  criteria={"theme"}
                  stackProps={{
                    className: "",
                  }}
                />
                <RecommendationCarousel
                  criteria={"genre"}
                  stackProps={{
                    className: "",
                  }}
                />
              </>
            )}

            <DetailsBox
              title={"Activity from our users"}
              stackProps={{
                className: "",
              }}
            >
              <HomeFeed>
                {({ fetchNextPage, hasNextPage }: InfiniteLoaderProps) => (
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
              </HomeFeed>
            </DetailsBox>
          </Stack>
        </Container>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
