import { Rating, RatingProps } from "@mantine/core";

/**
 * Common rating component <br>
 * Read-only by default.
 * @param props
 * @constructor
 */
const GameRating = (props: RatingProps) => {
  return (
    <Rating fractions={2} size={"md"} color={"var(--gn-brand)"} readOnly {...props} />
  );
};

export { GameRating };
