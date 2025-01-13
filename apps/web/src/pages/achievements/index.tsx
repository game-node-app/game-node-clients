import React, { useEffect } from "react";
import useUserId from "@/components/auth/hooks/useUserId";
import { useRouter } from "next/router";
import CenteredLoading from "@/components/general/CenteredLoading";
import { SessionAuth } from "supertokens-auth-react/recipe/session";

const Index = () => {
    const userId = useUserId();
    const router = useRouter();
    useEffect(() => {
        if (router.isReady && userId) {
            router.replace(`/achievements/${userId}`).then().catch();
        }
    }, [router, userId]);
    return (
        <SessionAuth>
            <CenteredLoading />
        </SessionAuth>
    );
};

export default Index;
