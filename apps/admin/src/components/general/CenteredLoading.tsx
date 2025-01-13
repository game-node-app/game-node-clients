import React from "react";
import {
    Center,
    CenterProps,
    Loader,
    Stack,
    StackProps,
    Text,
} from "@mantine/core";

interface Props extends StackProps {
    message?: string;
}

const CenteredLoading = (props: Props) => {
    return (
        <Stack
            justify={"center"}
            align={"center"}
            w={"100%"}
            h={"100%"}
            gap={2}
            {...props}
        >
            <Loader variant="bars" />
            <div className={"w-full"}></div>
            {props.message && <Text>{props.message}</Text>}
        </Stack>
    );
};

export default CenteredLoading;
