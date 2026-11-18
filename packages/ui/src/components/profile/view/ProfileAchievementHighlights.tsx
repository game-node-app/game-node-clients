import { AchievementBadge } from "#@/components/achievement/AchievementBadge";
import { useAchievementProgress } from "#@/components/achievement/hooks/useAchievementProgress";
import { useAchievementsV2 } from "#@/components/achievement/hooks/useAchievementsV2";
import { buildFeatsModel } from "#@/components/achievement/util/feats";
import { useAllObtainedAchievements } from "#@/components/achievement/hooks/useAllObtainedAchievements";
import { GameFigureImage } from "#@/components/game/figure/GameFigureImage";
import { useGames } from "#@/components/game/hooks/useGames";
import { useJournalObtainedAchievements } from "#@/components/journal/hooks/useJournalObtainedAchievements";
import {
  Box,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useI18nContext, useTranslation } from "@repo/locales";
import { IconTrophy } from "@tabler/icons-react";
import { useState } from "react";
import { CenteredLoading } from "#@/components/general/CenteredLoading";

interface Props {
  userId: string;
  showGameAchievements: boolean;
  onGameAchievements: () => void;
  onFeats: () => void;
}

const LINK_STYLE =
  "self-start text-sm text-[var(--profile-accent-text,var(--mantine-color-brand-filled))] hover:underline";
const CARD_STYLE = "bg-body";

function GameAchievementHighlights({
  userId,
  onViewAll,
}: {
  userId: string;
  onViewAll: () => void;
}) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const journal = useJournalObtainedAchievements(userId);
  const recent =
    journal.data?.years
      .flatMap((year) =>
        year.months.flatMap((month) =>
          month.games.flatMap(({ achievements, sourceName }) =>
            achievements
              .filter((achievement) => achievement.isObtained)
              .map((achievement) => ({ achievement, sourceName })),
          ),
        ),
      )
      .sort((a, b) =>
        (b.achievement.obtainedAt ?? "").localeCompare(
          a.achievement.obtainedAt ?? "",
        ),
      )
      .slice(0, 3) ?? [];
  const games = useGames(
    {
      gameIds: recent.length
        ? Array.from(
            new Set(recent.map(({ achievement }) => achievement.gameId)),
          )
        : undefined,
      relations: { cover: true },
    },
    false,
    { ownerUserId: userId },
  );
  const gamesById = new Map(games.data?.map((game) => [game.id, game]));

  return (
    <Stack component="section" gap="sm">
      <Stack gap={2}>
        <Title order={2} size="h4">
          {t("profile.overview.gameAchievements")}
        </Title>
        <Text size="sm" c="dimmed">
          {t("profile.overview.gameAchievementsHint")}
        </Text>
      </Stack>
      {journal.isLoading && <CenteredLoading />}
      {journal.isError && (
        <Text size="sm" c="dimmed">
          {t("profile.messages.fetchFailed")}
        </Text>
      )}
      {journal.isSuccess && recent.length === 0 && (
        <Text size="sm" c="dimmed">
          {t("profile.overview.noGameAchievements")}
        </Text>
      )}
      {recent.map(({ achievement, sourceName }) => {
        const game = gamesById.get(achievement.gameId);
        const rarity = achievement.steamDetails?.globalPercentage;
        return (
          <Paper
            key={`${achievement.source}-${achievement.externalGameId}-${achievement.externalId}`}
            withBorder
            radius="md"
            p="sm"
            className={CARD_STYLE}
          >
            <Group gap="md" wrap="nowrap">
              <Box className="w-10 shrink-0">
                {game ? (
                  <GameFigureImage game={game} />
                ) : (
                  <IconTrophy size={26} aria-hidden />
                )}
              </Box>
              <Stack gap={2} className="min-w-0">
                <Text size="sm" fw={600}>
                  {achievement.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {[game?.name, sourceName].filter(Boolean).join(" · ")}
                </Text>
                {rarity != null && (
                  <Text
                    size="xs"
                    c="var(--profile-accent-text, var(--mantine-color-dimmed))"
                  >
                    {t("profile.overview.achievementRarity", {
                      percent: rarity.toLocaleString(language, {
                        maximumFractionDigits: 1,
                      }),
                    })}
                  </Text>
                )}
              </Stack>
            </Group>
          </Paper>
        );
      })}
      <UnstyledButton className={LINK_STYLE} onClick={onViewAll}>
        {t("profile.overview.allGameAchievements")}
      </UnstyledButton>
    </Stack>
  );
}

export function ProfileAchievementHighlights({
  userId,
  showGameAchievements,
  onGameAchievements,
  onFeats,
}: Props) {
  const { t } = useTranslation();
  const feats = useAllObtainedAchievements(userId);
  const catalog = useAchievementsV2(userId);
  const progress = useAchievementProgress(userId);
  const [now] = useState(Date.now);
  const model = buildFeatsModel({
    achievements: catalog.data ?? [],
    progress: progress.data ?? [],
    now,
  });
  const featsById = new Map(
    model.items.map((item) => [item.achievement.id, item]),
  );
  const recentFeats = [...(feats.data ?? [])]
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
    .slice(0, 3);

  return (
    <Stack gap="xl" className="min-w-0">
      {showGameAchievements && (
        <GameAchievementHighlights
          userId={userId}
          onViewAll={onGameAchievements}
        />
      )}
      <Stack component="section" gap="sm">
        <Stack gap={2}>
          <Title order={2} size="h4">
            {t("profile.overview.gamenodeAchievements")}
          </Title>
          <Text size="sm" c="dimmed">
            {t("profile.overview.gamenodeAchievementsHint")}
          </Text>
        </Stack>
        {feats.isLoading && <CenteredLoading />}
        {feats.isError && (
          <Text size="sm" c="dimmed">
            {t("profile.messages.fetchFailed")}
          </Text>
        )}
        {feats.isSuccess && recentFeats.length === 0 && (
          <Text size="sm" c="dimmed">
            {t("profile.overview.noFeats")}
          </Text>
        )}
        {recentFeats.map(({ id, achievementId, achievement }) => {
          const feat = featsById.get(achievementId);
          const definition = feat?.achievement ?? achievement;
          return (
            <Paper
              key={id}
              withBorder
              radius="md"
              p="sm"
              className={CARD_STYLE}
            >
              <Group gap="md" wrap="nowrap">
                <Box className="shrink-0">
                  <AchievementBadge
                    icon={feat?.achievement.icon}
                    tier={feat?.progress?.tier ?? 0}
                    size={48}
                  />
                </Box>
                <Stack gap={2} className="min-w-0">
                  <Text size="sm" fw={600}>
                    {definition.name}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {definition.description}
                  </Text>
                  {feat && (
                    <Text
                      size="xs"
                      c="var(--profile-accent-text, var(--mantine-color-dimmed))"
                    >
                      {t("profile.overview.featXp", { xp: feat.earnedXp })}
                    </Text>
                  )}
                </Stack>
              </Group>
            </Paper>
          );
        })}
        <UnstyledButton className={LINK_STYLE} onClick={onFeats}>
          {t("profile.overview.allFeats")}
        </UnstyledButton>
      </Stack>
    </Stack>
  );
}
