import type { TGameOrSearchGame } from "#@/components/game/util/types";
import { cn } from "#@/util";
import { Box, Button, Stack, Text, UnstyledButton } from "@mantine/core";
import { AwardsGameCover } from "./AwardsGameCover";

export interface AwardsVoteBarContentProps {
  /** Caption above the game name ("Seu voto em Jogo do Ano"). */
  caption: string;
  game?: TGameOrSearchGame | null;
  gameName?: string | null;
  skipLabel: string;
  confirmLabel: string;
  onSkip: () => void;
  onConfirm: () => void;
  /** Disables skipping while the vote is in flight. */
  disabled?: boolean;
  loading?: boolean;
  /** Mobile sheet: confirm moves below the game row, at full width. */
  compact?: boolean;
}

/**
 * The pending-vote content of the vote bar: the picked game on the left and
 * "Pular" / "Confirmar" on the right (stacked on the mobile sheet).
 */
const AwardsVoteBarContent = ({
  caption,
  game,
  gameName,
  skipLabel,
  confirmLabel,
  onSkip,
  onConfirm,
  disabled = false,
  loading = false,
  compact = false,
}: AwardsVoteBarContentProps) => {
  const skip = (
    <UnstyledButton
      data-awards-vote-skip
      onClick={onSkip}
      disabled={disabled}
      className={cn(
        "shrink-0 rounded-[10px] px-[22px] py-[14px] text-[15px] font-semibold leading-[1.33] text-white transition-colors",
        "hover:bg-paper-1 disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      {skipLabel}
    </UnstyledButton>
  );

  const confirm = (
    <Button
      data-awards-vote-confirm
      onClick={onConfirm}
      loading={loading}
      color={"brand"}
      radius={10}
      fullWidth={compact}
      styles={{
        root: {
          "--button-color": "#0b0b0b",
          height: "auto",
          padding: "14px 22px",
        },
        label: { fontSize: 15, fontWeight: 600, lineHeight: 1.33 },
      }}
    >
      {confirmLabel}
    </Button>
  );

  const pick = (
    <div className={"flex min-w-0 flex-1 items-center gap-3"}>
      <Box className={"h-10 w-[30px] shrink-0 overflow-hidden rounded-[4px]"}>
        <AwardsGameCover
          game={game}
          className={"h-full"}
          imageProps={{ radius: 4 }}
        />
      </Box>
      <Stack gap={2} className={"min-w-0"}>
        <Text
          className={
            "truncate text-[12px] font-bold uppercase leading-[normal] tracking-[0.72px] text-dimmed-1"
          }
        >
          {caption}
        </Text>
        <Text
          className={
            "truncate text-[16px] font-medium leading-normal text-white"
          }
        >
          {gameName}
        </Text>
      </Stack>
    </div>
  );

  if (compact) {
    return (
      <div
        data-awards-vote-bar-content
        className={"flex w-full flex-col gap-3"}
      >
        <div className={"flex w-full items-center gap-3"}>
          {pick}
          {skip}
        </div>
        {confirm}
      </div>
    );
  }

  return (
    <div
      data-awards-vote-bar-content
      className={"flex w-full items-center justify-between gap-4"}
    >
      {pick}
      <div className={"flex shrink-0 items-center gap-2.5"}>
        {skip}
        {confirm}
      </div>
    </div>
  );
};

export { AwardsVoteBarContent };
