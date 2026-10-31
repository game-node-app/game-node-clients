import { getServerStoredIcon } from "#@/util";
import { Image, ImageProps } from "@mantine/core";

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