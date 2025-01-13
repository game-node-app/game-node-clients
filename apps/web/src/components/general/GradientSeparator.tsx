import React from "react";
import { Box, BoxProps } from "@mantine/core";

const GradientSeparator = ({ ...props }: BoxProps) => {
    return (
        <Box
            w={"100%"}
            h={"0.125rem"}
            bg={
                "linear-gradient(91deg, rgba(25, 25, 25, 0.00) 0%, #191919 0.01%, #FFF 50.90%, #191919 100%, rgba(15, 15, 15, 0.00) 100%)"
            }
            {...props}
        />
    );
};

export default GradientSeparator;
