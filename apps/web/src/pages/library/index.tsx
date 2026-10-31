import React, { useEffect } from "react";
import { useRouter } from "next/router";
import CenteredLoading from "@/components/general/CenteredLoading";
import { SessionAuth, useUserId } from "@repo/ui";

const RedirectToOwnLibrary = () => {
    const userId = useUserId();
    const router = useRouter();
    useEffect(() => {
        if (userId) {
            router.push("/library/" + userId);
        }
    }, [router, userId]);
    return <CenteredLoading />;
};

const Index = () => (
    <SessionAuth>
        <RedirectToOwnLibrary />
    </SessionAuth>
);

export default Index;
