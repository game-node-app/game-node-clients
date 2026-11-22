import { Skeleton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  GameFigureImage,
  JournalAchievementsGameGroupViewProps,
  JournalAchievementsIconsList,
  JournalAchievementsTags,
  useGame,
} from "@repo/ui";

/** Mobile card per game: small cover, name, platform chips, count and the medal grid. */
export const MobileJournalAchievementsGameGroup = ({
  userId,
  gameGroup,
}: JournalAchievementsGameGroupViewProps) => {
  const { t } = useTranslation();
  const { data: game, isLoading } = useGame(
    gameGroup.gameId,
    { relations: { cover: true } },
    { ownerUserId: userId },
  );
  const count = gameGroup.achievements.length;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-8 p-3">
      <div className="flex items-start gap-3">
        <div className="relative w-14 min-w-14">
          {isLoading ? (
            <Skeleton className="h-20 w-14" />
          ) : (
            <GameFigureImage game={game} />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            <p className="m-0 truncate text-[15px] font-semibold text-foreground">
              {game?.name}
            </p>
          )}
          <JournalAchievementsTags
            group={gameGroup}
            labels={{
              completed: t("journal.achievements.completed"),
              platinum: t("journal.achievements.platinum"),
            }}
          />
          <span className="text-xs uppercase tracking-wider text-dimmed-1">
            {t("journal.achievements.count", { count })}
          </span>
        </div>
      </div>
      <JournalAchievementsIconsList achievements={gameGroup.achievements} />
    </div>
  );
};
