import { BlogPostCard, GameRating, useGame } from "#@/components";
import { Stack, Text } from "@mantine/core";
import { BlogArticleDto } from "@repo/wrapper/server";

interface Props {
  post: BlogArticleDto;
}

const BlogPostsFeaturedReviewCard = ({ post }: Props) => {
  const reviewInfo = post.review;

  // The card shows the post's cover, not the game's, so the cover is not personalized.
  const gameQuery = useGame(
    reviewInfo?.gameId,
    {
      relations: {
        cover: true,
      },
    },
    "off",
  );

  if (reviewInfo == undefined) return null;

  return (
    <BlogPostCard
      post={post}
      blogRoutePrefix="/blog"
      categoryId="review"
      details={
        <Stack gap={4} className="border-t border-line pt-2">
          {gameQuery.data?.name && (
            <Text size="sm" fw={600} className="[overflow-wrap:anywhere]">
              {gameQuery.data.name}
            </Text>
          )}
          <GameRating size="sm" value={reviewInfo.rating} />
        </Stack>
      }
    />
  );
};

export { BlogPostsFeaturedReviewCard };
