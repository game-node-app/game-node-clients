import React from "react";
import { useRouter } from "next/router";
import { Container, Paper } from "@mantine/core";
import { DetailsBox } from "@/components/general/DetailsBox";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import CenteredLoading from "@/components/general/CenteredLoading";

import ProfileReviewListView from "@/components/profile/view/ProfileReviewListView";

const Index = () => {
    const router = useRouter();
    const { userId } = router.query;

    const profileQuery = useUserProfile(userId as string);
    const username = profileQuery.data?.username;
    if (profileQuery.isLoading) {
        return <CenteredLoading className={"mt-4"} />;
    }
    return (
        <Container
            fluid
            mih={"100%"}
            className={"flex flex-wrap justify-center"}
            p={0}
        >
            <Paper
                w={{
                    base: "100%",
                    lg: "80%",
                }}
            >
                <DetailsBox title={`${username}'s Reviews`}>
                    <ProfileReviewListView userId={userId as string} />
                </DetailsBox>
            </Paper>
        </Container>
    );
};

export default Index;
