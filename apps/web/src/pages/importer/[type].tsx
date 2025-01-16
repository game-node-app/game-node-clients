import React from "react";
import { useRouter } from "next/router";
import { Flex, Paper } from "@mantine/core";
import { ImporterScreen } from "@repo/ui";

function TypePage() {
    const router = useRouter();
    const { type } = router.query;

    return (
        <Flex justify={"center"} mih={"100vh"} p={0} wrap={"wrap"}>
            <Paper className={"w-full p-4"}>
                <ImporterScreen source={type as string} />
            </Paper>
        </Flex>
    );
}

export default TypePage;
