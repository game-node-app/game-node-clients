import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import PreferencesScreen from "@/components/preferences/PreferencesScreen";
import { PreferencesActiveCategory } from "@/components/preferences/PreferencesScreenSideBar";
import { Container } from "@mantine/core";

const Category = () => {
    const router = useRouter();
    const { category } = router.query;

    useEffect(() => {
        if (typeof category !== "string" && router.isReady) {
            router.push("/404");
        }
    }, [category, router]);

    return (
        <SessionAuth>
            <Container fluid pos={"relative"} p={0}>
                <PreferencesScreen
                    category={category as PreferencesActiveCategory}
                />
            </Container>
        </SessionAuth>
    );
};

export default Category;
