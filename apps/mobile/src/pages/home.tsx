import { IonContent, IonPage, IonRefresher, IonRefresherContent, useIonRouter } from "@ionic/react";
import React, { useState } from "react";
import { Container, Stack } from "@mantine/core";
import { DetailsBox } from "@/components/general/DetailsBox";
import RecommendationCarousel from "@/components/recommendation/carousel/RecommendationCarousel";
import useUserId from "@/components/auth/hooks/useUserId";
import ActivityFeed from "@/components/activity/ActivityFeed";
import ActivityFeedLayout, { ActivityFeedTabValue } from "@/components/activity/ActivityFeedLayout";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import SearchBar from "@/components/general/input/SearchBar/SearchBar";
import { useQueryClient } from "@tanstack/react-query";
import {TrendingReviewCarousel} from "@repo/ui";

const HomePage = () => {
    const router = useIonRouter();

    const queryClient = useQueryClient();

    const [query, setQuery] = useState<string>("");

    const userId = useUserId();
    const [selectedActivityTab, setSelectedActivityTab] = useState<ActivityFeedTabValue>("all");
    return (
        <IonPage>
            <IonContent>
                <IonRefresher
                    slot={"fixed"}
                    onIonRefresh={async (evt) => {
                        await queryClient.invalidateQueries({
                            queryKey: ["recommendation"],
                        });
                        await queryClient.invalidateQueries({
                            queryKey: ["activities"],
                        });
                        await queryClient.invalidateQueries({
                            queryKey: ["comments"],
                        });
                        evt.detail.complete();
                    }}
                >
                    <IonRefresherContent />
                </IonRefresher>

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
                            <ActivityFeedLayout currentTab={selectedActivityTab} onChange={setSelectedActivityTab}>
                                <ActivityFeed criteria={selectedActivityTab} />
                            </ActivityFeedLayout>
                        </DetailsBox>
                    </Stack>
                </Container>
            </IonContent>
        </IonPage>
    );
};

export default HomePage;
