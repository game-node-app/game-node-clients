import type { AwardsScoreboardPersonalGOTY } from "#@/components/awards/types";
import { AwardsGameCover } from "#@/components/awards/shared/AwardsGameCover";
import {
  formatNumber,
  useFormatLocale,
} from "#@/components/events/util/format";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { cn } from "#@/util";
import { Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { Game } from "@repo/wrapper/server";

export interface AwardsResultsPersonalGOTYProps {
  personalGOTY: AwardsScoreboardPersonalGOTY;
  game?: Game | null;
  className?: string;
}

/**
 * Final tile of the result grid (frame `5410:1063`): the viewer's personal
 * GOTY and how many other people picked it, on the brand-tinted frame.
 * `otherUsersCount` excludes the viewer, so the copy says "other people"
 * (G16); a zero count omits the sentence.
 */
export function AwardsResultsPersonalGOTY({
  personalGOTY,
  game,
  className,
}: AwardsResultsPersonalGOTYProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const count = formatNumber(personalGOTY.otherUsersCount, locale);
  const name =
    game?.name ?? t("awards.results.gameFallback", { id: personalGOTY.gameId });

  return (
    <div
      data-awards-results-personal-goty
      data-game-id={personalGOTY.gameId}
      className={cn(
        "flex items-center gap-4 rounded-[14px] border border-brand bg-brand-tint p-[14px]",
        className,
      )}
    >
      <Box className={"h-20 w-[60px] shrink-0 overflow-hidden rounded-[6px]"}>
        <AwardsGameCover
          game={game}
          size={ImageSize.COVER_BIG}
          className={"h-full"}
          imageProps={{ radius: 6 }}
        />
      </Box>
      <div className={"flex min-w-0 flex-1 flex-col items-start gap-1.5"}>
        <p
          className={
            "text-[12px] font-bold uppercase leading-[normal] tracking-[0.72px] text-brand-3"
          }
        >
          {t("awards.results.personalGoty.title")}
        </p>
        <p
          className={
            "break-words text-[16px] font-medium leading-normal text-foreground"
          }
        >
          {name}
        </p>
        {personalGOTY.otherUsersCount > 0 && count && (
          <p className={"text-[14px] leading-[1.43] text-nav-muted"}>
            {t("awards.results.personalGoty.others", { count })}
          </p>
        )}
      </div>
    </div>
  );
}
