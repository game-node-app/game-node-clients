import React, { useEffect } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { Container } from "@mantine/core";
import ActivityFeedLayout from "@/components/activity/ActivityFeedLayout";
import CenteredLoading from "@/components/general/CenteredLoading";
import { useRouter } from "next/router";

const Index = () => {
    const router = useRouter();
    const session = useSessionContext();
    useEffect(() => {
        if (!router.isReady || session.loading) return;

        if (session.doesSessionExist && session.userId != undefined) {
            router.push("/activity/following");
            return;
        }

        router.push("/activity/all");
    }, [router, session]);
    return (
        <Container fluid p={0}>
            <CenteredLoading />
        </Container>
    );
};

export default Index;
