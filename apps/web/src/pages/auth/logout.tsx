import CenteredLoading from "@/components/general/CenteredLoading";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { signOut } from "supertokens-auth-react/recipe/session";

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
