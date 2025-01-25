import React from "react";
import { Group } from "@mantine/core";

type GameNodeLogoProps = React.ComponentPropsWithoutRef<"img">;

const GameNodeLogo = ({ ...props }: GameNodeLogoProps) => {
  return (
    <Group gap={10}>
      <img
        alt={"GameNode logo"}
        className="w-full h-auto max-h-full "
        {...props}
        src={"/img/main-logo.png"}
      />
    </Group>
  );
};

export { GameNodeLogo };
