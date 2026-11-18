import {
  BlogPostCategoryLabel,
  BlogPostDate,
  GameRating,
  useGame,
} from "#@/components";
import { Link } from "#@/util";
import {
  AspectRatio,
  Box,
  Divider,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
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

  const imageUrl = post.cover.url;

  if (reviewInfo == undefined) return null;

  return (
    <Box
      className={"w-full h-full relative overflow-hidden rounded-lg bg-paper-1"}
    >
      <Stack
        className={
          "z-10 absolute w-full h-full justify-end items-center text-gray-100 px-4 pb-8"
        }
      >
        <BlogPostCategoryLabel tags={post.tags} categoryId="review" />
        <Link href={`/blog/post/${post.id}`}>
          <Title ta={"center"} size={"h3"} lineClamp={3}>
            {post.title}
          </Title>
        </Link>

        <Text lineClamp={2}>{post.excerpt}</Text>
        <BlogPostDate publishedAt={post.publishedAt} c="gray.4" />
        <Divider size={"lg"} className={"border-brand-5 w-full"} />
        <Link href={`/blog/post/${post.id}`} className={"w-full"}>
          <Group className={"w-full justify-between"}>
            <Title size={"h4"} lineClamp={2}>
              {gameQuery.data?.name}
            </Title>
            <GameRating size="sm" value={reviewInfo.rating} />
          </Group>
        </Link>
      </Stack>
      <AspectRatio ratio={3 / 4} className={"relative"}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0.1)_0%,_rgba(10,10,10,0.6)_54%,_rgba(0,0,0,1)_100%)]"></div>

        <Image src={imageUrl} alt={post.cover.alt} className={"rounded-sm"} />
      </AspectRatio>
    </Box>
  );
};

export { BlogPostsFeaturedReviewCard };
