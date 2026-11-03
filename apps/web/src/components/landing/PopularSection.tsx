import { Box, Container, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  DEFAULT_REVIEW_EDITOR_EXTENSIONS,
  GameRating,
  getCoverUrl,
  getSizedImageUrl,
  ImageSize,
  UserAvatarGroup,
  useGame,
  useGames,
  useReview,
  useTrendingGames,
  useTrendingReviews,
} from "@repo/ui";
import { StatisticsRankingsRequestDto } from "@repo/wrapper/server";
import { EditorContent, useEditor } from "@tiptap/react";
import Link from "next/link";
import { ReactNode } from "react";
import styles from "@/components/landing/Landing.module.css";

const REQUEST = {
  period: StatisticsRankingsRequestDto.period.MONTH,
  offset: 0,
  limit: 12,
};

/**
 * Two copies of the items scroll by -50%, so the loop is seamless. The second copy is `inert`
 * to keep keyboard and screen reader users from meeting every item twice.
 */
const Marquee = ({
  children,
  count,
  reverse,
}: {
  children: ReactNode;
  count: number;
  reverse?: boolean;
}) => (
  <Box className={styles.marquee}>
    <Box
      className={`${styles.marqueeTrack} ${reverse ? styles.marqueeReverse : ""}`}
      style={{ "--duration": `${count * 6}s` } as React.CSSProperties}
    >
      <Box className={styles.marqueeSet}>{children}</Box>
      <Box className={styles.marqueeSet} aria-hidden inert>
        {children}
      </Box>
    </Box>
  </Box>
);

const GameCard = ({ gameId }: { gameId: number }) => {
  const gameQuery = useGame(gameId, { relations: { cover: true } });
  const game = gameQuery.data;
  if (!game) return <Skeleton className={styles.gameCard} />;

  return (
    <Link href={`/game/${game.id}`} className={styles.gameCard}>
      <img
        src={
          getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_BIG) ??
          "/img/game_placeholder.jpeg"
        }
        alt={game.name}
        loading="lazy"
      />
    </Link>
  );
};

const ReviewCard = ({ reviewId }: { reviewId: string }) => {
  const reviewQuery = useReview(reviewId);
  const review = reviewQuery.data;
  const gameQuery = useGame(review?.gameId, { relations: { cover: true } });
  const game = gameQuery.data;
  const editor = useEditor(
    {
      extensions: DEFAULT_REVIEW_EDITOR_EXTENSIONS,
      editable: false,
      content: review?.content,
      immediatelyRender: false,
    },
    [review?.content],
  );

  if (!review || !game) return <Skeleton className={styles.reviewCard} />;

  return (
    <Box className={styles.reviewCard}>
      <Box className={styles.reviewHeader}>
        <img
          src={
            getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_BIG) ??
            "/img/game_placeholder.jpeg"
          }
          alt=""
          loading="lazy"
        />
        <Stack gap={4}>
          {/* Stretched link: its ::after covers the whole card, so the card stays one anchor. */}
          <Link
            href={`/game/${game.id}?reviewId=${reviewId}`}
            className={styles.reviewLink}
          >
            {game.name}
          </Link>
          <UserAvatarGroup
            userId={review.profileUserId}
            avatarProps={{ size: "xs" }}
            groupProps={{ gap: "xs" }}
            textProps={{ lineClamp: 1, size: "xs", c: "dimmed" }}
          />
          <GameRating value={review.rating} size="md" />
        </Stack>
      </Box>
      <EditorContent editor={editor} className={styles.reviewContent} />
    </Box>
  );
};

export const PopularSection = () => {
  const { t } = useTranslation();
  const gamesQuery = useTrendingGames(REQUEST);
  const reviewsQuery = useTrendingReviews(REQUEST);

  const gameIds = (gamesQuery.data?.items ?? [])
    .map((item) => item.sourceId)
    .filter((id): id is number => typeof id === "number");
  const reviewIds = (reviewsQuery.data?.items ?? [])
    .map((item) => item.sourceId)
    .filter((id): id is string => typeof id === "string");

  if (gameIds.length === 0 && reviewIds.length === 0) return null;

  return (
    <Container component="section" size={1302} className={styles.section}>
      <Stack gap={56}>
        <Stack align="center" gap={16} maw={880} mx="auto" ta="center">
          <Text className={styles.eyebrow}>
            {t("landing.presentation.communityLabel")}
          </Text>
          <Title order={2}>
            {t("landing.presentation.communitySectionTitle")}
          </Title>
          <Text c="dimmed" size="lg">
            {t("landing.presentation.communitySectionDescription")}
          </Text>
        </Stack>
        {gameIds.length > 0 && (
          <Stack gap={24}>
            <Title order={3} fz={20} fw={600} c="dimmed" ta="center">
              {t("landing.presentation.popularGames")}
            </Title>
            <Marquee count={gameIds.length}>
              {gameIds.map((id) => (
                <GameCard key={id} gameId={id} />
              ))}
            </Marquee>
          </Stack>
        )}
        {reviewIds.length > 0 && (
          <Stack gap={24}>
            <Title order={3} fz={20} fw={600} c="dimmed" ta="center">
              {t("landing.presentation.popularReviews")}
            </Title>
            <Marquee count={reviewIds.length} reverse>
              {reviewIds.map((id) => (
                <ReviewCard key={id} reviewId={id} />
              ))}
            </Marquee>
          </Stack>
        )}
      </Stack>
    </Container>
  );
};
