import React, { useEffect } from "react";
import CenteredLoading from "@/components/general/CenteredLoading";
import { useRouter } from "next/router";
import { Container } from "@mantine/core";

const Index = () => {
    const router = useRouter();
    useEffect(() => {
        if (router.isReady) {
            router.push("/wizard/init/username");
        }
    }, [router]);
    return (
        <Container fluid>
            <CenteredLoading />
        </Container>
    );
};

export default Index;
