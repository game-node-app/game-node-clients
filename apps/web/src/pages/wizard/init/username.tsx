import React from "react";
import { Container, Title } from "@mantine/core";
import ProfileEditUsernameUpdate from "@/components/profile/edit/ProfileEditUsernameUpdate";
import { useRouter } from "next/router";

const Username = () => {
    const router = useRouter();
    return (
        <Container fluid mih={"100vh"}>
            <Title size={"h3"} className={"text-center my-8"}>
                How should we call you?
            </Title>
            <ProfileEditUsernameUpdate
                withSkipButton
                onClose={() => {
                    router.push("/wizard/init/avatar");
                }}
                onSkip={() => {
                    router.push("/wizard/init/avatar");
                }}
            />
        </Container>
    );
};

export default Username;
