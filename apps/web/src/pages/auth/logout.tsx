import CenteredLoading from "@/components/general/CenteredLoading";
import { signOut } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Logout = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    useEffect(() => {
        let ignore = false;
        (async () => {
            if (ignore) return;
            await signOut(queryClient);
            router.push("/search");
        })();
        return () => {
            ignore = true;
        };
    }, [queryClient, router]);
    return <CenteredLoading></CenteredLoading>;
};

export default Logout;
