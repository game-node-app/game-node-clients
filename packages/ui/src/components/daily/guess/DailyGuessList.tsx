import { Fragment } from "react";
import { Divider, Paper } from "@mantine/core";
import { DailyGuessFeedbackDto } from "@repo/wrapper/server";
import { DailyGuessRow } from "#@/components/daily/guess/DailyGuessRow";

interface Props {
  /** Newest first. */
  feedback: DailyGuessFeedbackDto[];
}

/** All the guesses in one panel, instead of a bordered card per guess. */
const DailyGuessList = ({ feedback }: Props) => {
  if (feedback.length === 0) return null;

  return (
    <Paper withBorder className={"w-full overflow-hidden"}>
      {feedback.map((item, index) => (
        <Fragment key={feedback.length - index}>
          {index > 0 && <Divider />}
          <DailyGuessRow feedback={item} />
        </Fragment>
      ))}
    </Paper>
  );
};

export { DailyGuessList };
