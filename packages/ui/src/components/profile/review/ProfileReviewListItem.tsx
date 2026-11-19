import {
  DEFAULT_REVIEW_EDITOR_EXTENSIONS,
  GameFigureImage,
  GameRating,
  ItemLikesButton,
  TextLink,
  useGame,
} from "#@/components";
import { RelativeDate } from "#@/components/general/RelativeDate";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { ReviewListItemComments } from "#@/components/review/view/ReviewListItemComments";
import { ReviewListItemDropdownButton } from "#@/components/review/view/ReviewListItemDropdownButton";
import { buildPresenterComponent } from "#@/context";
import { Link, useRouter } from "#@/util";
import { Box, Divider, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { Review, StatisticsSourceRequestDto } from "@repo/wrapper/server";
import type { ReactElement } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import sourceType = StatisticsSourceRequestDto.sourceType;

interface Props {
  review: Review;
  preview?: boolean;
}

export interface ProfileReviewListItemProps {
  review: Review;
}

/**
 * Game (with cover) of a review, loaded for the review's owner. Shared by the
 * default list item and the presenters registered by the apps.
 */
function useProfileReviewGame(review: Review) {
  return useGame(
    review.gameId,
    {
      relations: {
        cover: true,
      },
    },
    { ownerUserId: review.profileUserId },
  );
}

/**
 * Renders a preview of a user's review with a visit button.
 * @constructor
 */
const DEFAULT_ProfileReviewListItem = ({ review, preview = false }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const gameQuery = useProfileReviewGame(review);

  const editor = useEditor(
    {
      extensions: DEFAULT_REVIEW_EDITOR_EXTENSIONS,
      editable: false,
      immediatelyRender: false,
      content: review.content ?? `<p>${t("review.messages.noContent")}</p>`,
    },
    [review.content, t],
  );

  const gameReviewsHref = `/game/${review.gameId}?tab=reviews`;
  const reviewHref = `${gameReviewsHref}&reviewId=${review.id}`;

  if (preview) {
    const game = gameQuery.data ?? review.game;
    return (
      <Stack component="article" gap="xs" className="min-w-0">
        <Group gap="xs" wrap="nowrap">
          {game && (
            <Box className="w-8 shrink-0">
              <GameFigureImage game={game} />
            </Box>
          )}
          <Stack gap={2} className="min-w-0">
            <Text
              component={Link}
              href={reviewHref}
              size="sm"
              fw={600}
              truncate
              className="hover:underline"
            >
              {game?.name ?? t("profile.tabs.reviews")}
            </Text>
            <RelativeDate date={review.createdAt} force size="xs" c="dimmed" />
          </Stack>
        </Group>
        <Paper
          radius="md"
          className="flex min-h-32 flex-1 flex-col overflow-hidden bg-paper-5"
        >
          <Group gap={6} wrap="nowrap" px="xs" justify="space-between">
            <Group gap={6} wrap="nowrap" className="min-w-0">
              <UserAvatar
                userId={review.profileUserId}
                profile={review.profile}
                size={24}
              />
              <Text size="sm" fw={500} truncate>
                {review.profile?.username}
              </Text>
            </Group>
            <ReviewListItemDropdownButton
              review={review}
              onEditStart={() =>
                void router.push(
                  `${gameReviewsHref}&editReviewId=${encodeURIComponent(review.id)}`,
                )
              }
            />
          </Group>
          <Box px="xs" pb={6} className="flex-1 text-sm text-dimmed">
            {review.content ? (
              <EditorContent
                editor={editor}
                className="line-clamp-2 break-words"
              />
            ) : (
              <Text size="sm" c="dimmed">
                {t("review.messages.noContent")}
              </Text>
            )}
          </Box>
          <Divider />
          <Group gap={4} px="xs" py={4} justify="space-between">
            <GameRating value={review.rating} size="sm" />
            <Group gap={4} wrap="nowrap">
              <ReviewListItemComments review={review} />
              <ItemLikesButton
                sourceId={review.id}
                sourceType={sourceType.REVIEW}
              />
            </Group>
          </Group>
        </Paper>
      </Stack>
    );
  }

  return (
    <Group className={"w-full flex-nowrap p-2 bg-[#222222] items-start"}>
      <Stack className={"w-3/12 lg:w-2/12 items-center justify-start"}>
        <Box className={"w-11/12"}>
          <GameFigureImage game={gameQuery.data} />
        </Box>
        <Title size={"h4"} className={"text-center"}>
          {gameQuery.data?.name}
        </Title>
      </Stack>
      <Stack className={"w-9/12 lg:w-10/12 px-2 gap-2 min-h-64"}>
        <EditorContent editor={editor} className={"line-clamp-[12]"} />
        <Divider className={"w-full mt-auto"} />
        <Group className={"w-full justify-between flex-nowrap"}>
          <TextLink href={reviewHref} className={"text-dimmed"}>
            {t("actions.viewMore")}
          </TextLink>
          <Group className={"flex-nowrap"}>
            <ItemLikesButton
              sourceId={review.id}
              sourceType={sourceType.REVIEW}
            />
            <GameRating value={review.rating} />
          </Group>
        </Group>
      </Stack>
    </Group>
  );
};

/**
 * Only the full list item (`preview = false`) can be replaced by a presenter;
 * the compact preview always renders the default layout.
 */
const ProfileReviewListItemPresenter = buildPresenterComponent(
  "ProfileReviewListItem",
  ({ review }: ProfileReviewListItemProps) => (
    <DEFAULT_ProfileReviewListItem review={review} />
  ),
);

const ProfileReviewListItem = ({
  review,
  preview = false,
}: Props): ReactElement =>
  preview ? (
    <DEFAULT_ProfileReviewListItem review={review} preview />
  ) : (
    <ProfileReviewListItemPresenter review={review} />
  );

export { ProfileReviewListItem, useProfileReviewGame };
