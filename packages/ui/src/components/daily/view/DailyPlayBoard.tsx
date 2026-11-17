import type { ReactNode } from "react";
import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { DailyGuessInput } from "#@/components/daily/guess/DailyGuessInput";
import { DailyGuessList } from "#@/components/daily/guess/DailyGuessList";
import { DailySpecsTable } from "#@/components/daily/guess/DailySpecsTable";
import { DailyImageHint } from "#@/components/daily/hint/DailyImageHint";
import { DailyKeywordsHint } from "#@/components/daily/hint/DailyKeywordsHint";
import { DailySpecsSummary } from "#@/components/daily/hint/DailySpecsSummary";
import { DailyLives } from "#@/components/daily/result/DailyLives";
import { DailyResultPanel } from "#@/components/daily/result/DailyResultPanel";
import type { DailyBoardState } from "#@/components/daily/util/dailyBoardState";

interface Props {
  play: DailyBoardState;
  onGuess: (gameId: number) => void;
  onSkip: () => void;
  onUseHint: () => void;
  submitting?: boolean;
  /** Rendered after the guesses once the puzzle is finished. */
  children?: ReactNode;
}

/**
 * Hint, guess input, lives and guesses while playing; the answer and the guesses once finished.
 */
const DailyPlayBoard = ({
  play,
  onGuess,
  onSkip,
  onUseHint,
  submitting,
  children,
}: Props) => {
  const { t } = useTranslation();
  const { hints } = play;
  const newestFirst = [...play.feedback].reverse();
  const latest = newestFirst[0];
  const specs = play.mode === "specs";

  const hint = specs ? (
    <DailySpecsSummary
      play={play}
      onUseHint={onUseHint}
      disabled={submitting}
    />
  ) : play.mode === "keywords" ? (
    <DailyKeywordsHint
      keywords={hints.keywords}
      imageTokens={hints.imageTokens}
      attempts={play.attempts}
      maxAttempts={play.maxAttempts}
    />
  ) : (
    <DailyImageHint
      key={hints.imageTokens.length}
      tokens={hints.imageTokens}
      ratio={play.mode === "artwork" ? 16 / 9 : 3 / 4}
      maskTitle={play.mode === "cover"}
    />
  );
  const guesses = specs ? (
    <DailySpecsTable feedback={newestFirst} />
  ) : (
    <DailyGuessList feedback={newestFirst} />
  );

  return (
    <Stack className={"w-full gap-5"}>
      {/* Announces each new guess to screen readers. */}
      <div aria-live={"polite"} className={"sr-only"}>
        {latest &&
          (latest.name
            ? t("daily.announce.guess", {
                name: latest.name,
                result: t(`daily.results.${latest.result}`),
              })
            : t("daily.announce.skipped"))}
      </div>
      {play.status === "in_progress" ? (
        <>
          {hint}
          <DailyGuessInput
            guessedIds={play.feedback.map((feedback) => feedback.gameId)}
            onGuess={onGuess}
            onSkip={onSkip}
            disabled={submitting}
          />
          <DailyLives
            remaining={play.maxAttempts - play.attempts}
            max={play.maxAttempts}
            className={"justify-center"}
          />
          {guesses}
        </>
      ) : (
        <>
          <DailyResultPanel play={play} />
          {guesses}
          {children}
        </>
      )}
    </Stack>
  );
};

export { DailyPlayBoard };
