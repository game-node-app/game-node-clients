import React from "react";
import { Badge, Group, Image } from "@mantine/core";

interface GameNodeLogoProps extends React.ComponentPropsWithoutRef<"img"> {}

const GameNodeLogo = ({ ...props }: GameNodeLogoProps) => {
    return (
        <Group gap={10}>
            <img
                className="w-full h-auto max-h-full "
                {...props}
                src={"/img/main-logo.png"}
            />
            <Badge>ADMIN</Badge>
        </Group>
    );
};

export default GameNodeLogo;
