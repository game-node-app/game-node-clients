import React, { useEffect } from "react";
import { useRouter } from "next/router";
import CenteredLoading from "@/components/general/CenteredLoading";

const Index = () => {
    const router = useRouter();
    useEffect(() => {
        if (router.isReady) {
            router.push("/preferences/connections");
        }
    }, [router]);
    return <CenteredLoading />;
};

export default Index;
