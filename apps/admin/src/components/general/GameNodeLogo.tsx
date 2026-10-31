import { Badge, Group } from "@mantine/core";
import React from "react";

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
