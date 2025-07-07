import React from "react";
import {
  DetailsBox,
  GameInfoTimeToBeatItem,
  useTimeToBeat,
} from "#@/components";

interface Props {
  gameId: number;
}

const GameInfoTimeToBeat = ({ gameId }: Props) => {
  const { data, isLoading, isError } = useTimeToBeat(gameId);

  return (
    <DetailsBox title={"Time to beat"} withPadding withBorder withDimmedTitle>
      <GameInfoTimeToBeatItem title={"Main Story"} seconds={data?.main ?? 0} />
      <GameInfoTimeToBeatItem
        title={"Main + Extras"}
        seconds={data?.mainPlusSides ?? 0}
      />
      <GameInfoTimeToBeatItem
        title={"Completionist"}
        seconds={data?.completionist ?? 0}
      />
    </DetailsBox>
  );
};

export { GameInfoTimeToBeat };
