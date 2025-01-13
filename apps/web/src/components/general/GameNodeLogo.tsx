import React from "react";
import { Badge, Group, Image } from "@mantine/core";
interface GameNodeLogoProps extends React.ComponentPropsWithoutRef<"img"> {
    withBetaBadge?: boolean;
}
const GameNodeLogo = ({
    withBetaBadge = true,
    ...props
}: GameNodeLogoProps) => {
    return (
        <Group gap={10}>
            <img
                className="w-full h-auto max-h-full "
                {...props}
                src={"/img/main-logo.png"}
            />
            {withBetaBadge && <Badge>BETA</Badge>}
        </Group>
    );
};

export default GameNodeLogo;
