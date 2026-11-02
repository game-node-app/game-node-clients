import { UserAvatarGroup } from "#@/components";
import { Link } from "#@/util";
import {
  AspectRatio,
  Box,
  Card,
  Group,
  Image,
  ImageProps,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { BlogArticleDto } from "@repo/wrapper/server";
import dayjs from "dayjs";

interface Props {
  post: BlogArticleDto;
  imageProps?: ImageProps;
  blogRoutePrefix: string;
}

const BlogPostCard = ({ post, blogRoutePrefix }: Props) => {
  const imageUrl = post.cover.url;

  return (
    <Card
      shadow="sm"
      radius="md"
      padding={"md"}
      className="gn-blog-card group bg-paper w-full h-full transition-shadow duration-200 hover:shadow-xl"
    >
      <Card.Section className={"overflow-hidden"}>
        <AspectRatio ratio={37 / 28}>
          <Image
            src={imageUrl}
            alt={post.cover.alt}
            className={
              "transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
            }
          />
        </AspectRatio>
      </Card.Section>
      <Stack className={"gap-1.5 mt-md mb-md"}>
        {/* stretched link: its ::after covers the card, so the whole card opens the post */}
        <Link
          href={`${blogRoutePrefix}/post/${post.id}`}
          className={
            "gn-blog-card-link after:absolute after:inset-0 after:content-['']"
          }
        >
          <Title
            order={3}
            size={"h4"}
            fw={600}
            lh={1.3}
            c={"white"}
            lineClamp={2}
          >
            {post.title}
          </Title>
        </Link>
        <Text size={"sm"} c={"dimmed"} lineClamp={3}>
          {post.excerpt}
        </Text>
      </Stack>
      <Group className={"mt-auto justify-between flex-nowrap gap-5"}>
        {/* above the stretched link, so the author still opens their profile */}
        <Box className={"relative z-[1] max-w-40 lg:max-w-48"}>
          <UserAvatarGroup
            avatarProps={{
              size: "sm",
            }}
            groupProps={{
              gap: 6,
            }}
            textProps={{ size: "sm" }}
            userId={post.profileUserId}
          />
        </Box>
        <Text size={"sm"} c={"dimmed"} className={"tabular-nums"}>
          {dayjs(post.publishedAt).format("DD/MM/YYYY")}
        </Text>
      </Group>
    </Card>
  );
};

export { BlogPostCard };
