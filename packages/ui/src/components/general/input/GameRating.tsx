import { RATING_STAR_COLOR } from "#@/util";
import { Rating, RatingProps } from "@mantine/core";

/**
 * Common rating component <br>
 * Read-only by default.
 * @param props
 * @constructor
 */
const GameRating = (props: RatingProps) => {
  return (
    <Rating
      fractions={2}
      size={"md"}
      color={RATING_STAR_COLOR}
      readOnly
      {...props}
    />
  );
};

export { GameRating };
