import { Button, Skeleton, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { BlogArticleDto } from "@repo/wrapper/server";
import { IconChevronRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Link } from "#@/util";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";

interface Props {
  posts: BlogArticleDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const formatDate = (date: string) => dayjs(date).format("DD/MM/YYYY");

/** Plain author line: the cards are links themselves, so no nested profile link. */
const Author = ({ userId }: { userId: string }) => {
  const profileQuery = useUserProfile(userId);
  return (
    <>
      <UserAvatar userId={userId} size={20} />
      <span className={"gn-blog-author"}>{profileQuery.data?.username}</span>
    </>
  );
};

/** Compact blog card: cover on the left, title and date beside it (also the Xbox feed's side column). */
const ConsoleBlogItem = ({ post }: { post: BlogArticleDto }) => (
  <Link href={`/blog/post/${post.id}`} className={"gn-blog-item"}>
    <img
      className={"gn-blog-item-cover"}
      src={post.cover.url}
      alt={""}
      loading={"lazy"}
    />
    <span className={"gn-blog-item-body"}>
      <span className={"gn-blog-item-title"}>{post.title}</span>
      <span className={"gn-blog-date"}>{formatDate(post.publishedAt)}</span>
    </span>
  </Link>
);

/** Home blog tile: the cover uncropped on top (covers are text graphics), then title, excerpt and author. */
const BlogTile = ({ post }: { post: BlogArticleDto }) => (
  <Link href={`/blog/post/${post.id}`} className={"gn-blog-tile"}>
    <img
      className={"gn-blog-tile-cover"}
      src={post.cover.url}
      alt={""}
      loading={"lazy"}
    />
    <span className={"gn-blog-tile-body"}>
      <span className={"gn-blog-tile-title"}>{post.title}</span>
      <span className={"gn-blog-excerpt"}>{post.excerpt}</span>
      <span className={"gn-blog-meta"}>
        <Author userId={post.profileUserId} />
        <span className={"gn-blog-date"}>{formatDate(post.publishedAt)}</span>
      </span>
    </span>
  </Link>
);

/**
 * Xbox "what's new": up to four posts as same-size tiles, so the row stays balanced with any count.
 * Replaces the blog carousel on the Xbox theme (see RecentBlogPostsCarousel).
 */
const ConsoleBlogSection = ({ posts, isLoading, isError, onRetry }: Props) => {
  const { t } = useTranslation();
  const visible = posts?.slice(0, 4) ?? [];

  return (
    <section className={"gn-blog-section"}>
      <div className={"gn-blog-section-head"}>
        <Text className={"gn-console-row-title"}>{t("blog.recentPosts")}</Text>
        <Link href={"/blog"} className={"gn-blog-section-more"}>
          {t("blog.buttons.seeMore")}
          <IconChevronRight size={16} aria-hidden />
        </Link>
      </div>

      {isError && (
        <Button variant={"default"} onClick={onRetry} className={"self-start"}>
          {t("blog.read.error")} {t("blog.read.retry")}
        </Button>
      )}
      {!isLoading && !isError && posts?.length === 0 && (
        <Text c={"dimmed"}>{t("blog.list.empty")}</Text>
      )}

      {(isLoading || visible.length > 0) && (
        <div className={"gn-blog-grid"}>
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <Skeleton
                  key={i}
                  className={"gn-blog-tile gn-blog-tile-skeleton"}
                />
              ))
            : visible.map((post) => <BlogTile key={post.id} post={post} />)}
        </div>
      )}
    </section>
  );
};

export { ConsoleBlogItem, ConsoleBlogSection };
