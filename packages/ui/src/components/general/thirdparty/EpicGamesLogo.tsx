import React from "react";
import { Image, ImageProps } from "@mantine/core";
import { getServerStoredIcon } from "#@/util";

const EpicGamesLogo = (props: Omit<ImageProps, "src" | "alt">) => {
  return (
    <Image
      src={getServerStoredIcon("epicgames_black")}
      alt={"Epic Games logo"}
      {...props}
    />
  );
};

export { EpicGamesLogo };
