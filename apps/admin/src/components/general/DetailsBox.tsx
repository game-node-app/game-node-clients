import { Box, Stack, StackProps, Text } from "@mantine/core";
import React, { PropsWithChildren } from "react";

interface IDetailsBoxProps extends PropsWithChildren {
    enabled?: boolean;
    title: string;
    withDimmedTitle?: boolean;
    withBorder?: boolean;
    description?: string | undefined;
    stackProps?: StackProps;
}

export const DetailsBox = ({
    enabled = true,
    title,
    withDimmedTitle = false,
    withBorder = false,
    description,
    stackProps,
    children,
}: IDetailsBoxProps) => {
    return (
        enabled && (
            <Stack
                w={"100%"}
                h={"fit-content"}
                styles={{
                    root: {
                        borderWidth: withBorder ? "2px" : undefined,
                        borderColor: withBorder ? "#1F1F1F" : undefined,
                        borderRadius: withBorder ? "6px" : undefined,
                    },
                }}
                gap={"0.5rem"}
                className={`justify-start px-4 py-2 `}
                {...stackProps}
            >
                <Text
                    className={
                        withDimmedTitle
                            ? "text-[#5C5C5C] text-sm"
                            : "font-bold text-md"
                    }
                >
                    {title}
                </Text>
                {description && (
                    <Text fz={"sm"} lh={"md"} c={"dimmed"} className="">
                        {description}
                    </Text>
                )}
                {children}
            </Stack>
        )
    );
};
