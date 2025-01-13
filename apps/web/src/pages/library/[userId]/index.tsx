import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Container, Stack, Title } from "@mantine/core";
import LibraryView from "@/components/library/view/LibraryView";
import ProfileFavoriteGames from "@/components/profile/view/ProfileFavoriteGames";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import { DetailsBox } from "@/components/general/DetailsBox";
import RecentCollectionEntriesView from "@/components/collection/collection-entry/view/RecentCollectionEntriesView";
import useOnMobile from "@/components/general/hooks/useOnMobile";

const Index = () => {
    const onMobile = useOnMobile();
    const router = useRouter();
    const { userId } = router.query;
    const userProfileQuery = useUserProfile(userId as string);

    return (
        <LibraryView
            userId={userId as string | undefined}
            collectionId={undefined}
        >
            <Container fluid p={0}>
                <Stack
                    w={"100%"}
                    h={"100%"}
                    justify={"center"}
                    align={"center"}
                    mt={"sm"}
                >
                    <DetailsBox
                        title={`${userProfileQuery.data?.username}'s Recent Games`}
                        stackProps={{ className: "w-full" }}
                    >
                        <RecentCollectionEntriesView
                            userId={userId as string}
                            limit={onMobile ? 12 : 15}
                        />
                    </DetailsBox>
                </Stack>
            </Container>
        </LibraryView>
    );
};

export default Index;
