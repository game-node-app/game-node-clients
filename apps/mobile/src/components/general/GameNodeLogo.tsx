import React from "react";
import { Badge, Group, Image } from "@mantine/core";
interface GameNodeLogoProps extends React.ComponentPropsWithoutRef<"img"> {
    withBadge?: boolean;
}
const GameNodeLogo = ({ withBadge = true, ...props }: GameNodeLogoProps) => {
    return (
        <Group gap={10}>
            <img
                className="w-full h-auto max-h-full "
                {...props}
                src={"/img/main-logo.png"}
            />
            {withBadge && <Badge>BETA</Badge>}
        </Group>
    );
};

export default GameNodeLogo;
