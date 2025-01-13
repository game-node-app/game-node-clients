import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Session, { signOut } from "supertokens-auth-react/recipe/session";
import { useQueryClient } from "@tanstack/react-query";
import CenteredLoading from "@/components/general/CenteredLoading";

const Logout = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    useEffect(() => {
        let ignore = false;
        (async () => {
            if (ignore) return;
            await signOut();
            queryClient.clear();
            router.push("/search");
        })();
        return () => {
            ignore = true;
        };
    }, [queryClient, router]);
    return <CenteredLoading></CenteredLoading>;
};

export default Logout;
