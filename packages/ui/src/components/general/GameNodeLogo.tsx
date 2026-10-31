import React from "react";

type GameNodeLogoProps = React.ComponentPropsWithoutRef<"img">;

const GameNodeLogo = ({ ...props }: GameNodeLogoProps) => {
  return (
    <img
      alt={"GameNode logo"}
      className="w-full h-auto max-h-full "
      {...props}
      src={"/img/main-logo.png"}
    />
  );
};

export { GameNodeLogo };
