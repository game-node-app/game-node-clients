import { Stack } from "@mantine/core";
import { DailyGuessFeedbackDto } from "@repo/wrapper/server";
import { DailyGuessRow } from "#@/components/daily/guess/DailyGuessRow";
import { useGames } from "#@/components/game/hooks/useGames";

interface Props {
  /** Newest first. */
  feedback: DailyGuessFeedbackDto[];
}

const DailyGuessList = ({ feedback }: Props) => {
  const gameIds = feedback.flatMap((item) =>
    item.gameId == null ? [] : [item.gameId],
  );
  // One request for every guessed game's cover and year.
  const gamesQuery = useGames({ gameIds, relations: { cover: true } }, true);
  if (feedback.length === 0) return null;

  return (
    <Stack className={"w-full gap-2"}>
      {feedback.map((item, index) => (
        <DailyGuessRow
          key={feedback.length - index}
          feedback={item}
          game={gamesQuery.data?.find((game) => game.id === item.gameId)}
        />
      ))}
    </Stack>
  );
};

export { DailyGuessList };
