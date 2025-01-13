import React, { useEffect } from "react";
import { useRouter } from "next/router";
import CenteredLoading from "@/components/general/CenteredLoading";
import { useSessionContext } from "supertokens-auth-react/recipe/session";

const Index = () => {
    const session = useSessionContext();
    const router = useRouter();
    useEffect(() => {
        if (!session.loading && !session.doesSessionExist) {
            router.push("/auth");
        } else if (!session.loading && session.doesSessionExist) {
            router.push("/library/" + session.userId);
        }
    }, [router, session]);
    return <CenteredLoading />;
};

export default Index;
