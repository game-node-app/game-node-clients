import { Button, Skeleton, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { BlogArticleDto } from "@repo/wrapper/server";
import { IconChevronRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Link } from "#@/util";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { useBlogPosts } from "#@/components/blog/hooks/useBlogPosts";
import classes from "./ConsoleBlogSection.module.css";

export interface ConsoleBlogSectionProps {
  posts: BlogArticleDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const formatDate = (date: string) => dayjs(date).format("DD/MM/YYYY");

/** Plain author line: the cards are links themselves, so no nested profile link. */
const BlogAuthor = ({ userId }: { userId: string }) => {
  const profileQuery = useUserProfile(userId);
  return (
    <>
      <UserAvatar userId={userId} size={20} />
      <span className={classes.blogAuthor}>{profileQuery.data?.username}</span>
    </>
  );
};

/** Compact blog card: cover on the left, title and date beside it (the Xbox feed's side column reuses it). */
const ConsoleBlogItem = ({ post }: { post: BlogArticleDto }) => (
  <Link
    href={`/blog/post/${post.id}`}
    data-console-blog-item
    className={classes.blogItem}
  >
    <img
      className={classes.blogItemCover}
      src={post.cover.url}
      alt={""}
      loading={"lazy"}
    />
    <span className={classes.blogItemBody}>
      <span className={classes.blogItemTitle}>{post.title}</span>
      <span className={classes.blogDate}>{formatDate(post.publishedAt)}</span>
    </span>
  </Link>
);

/** Home blog tile: the cover uncropped on top (covers are text graphics), then title, excerpt and author. */
const ConsoleBlogTile = ({ post }: { post: BlogArticleDto }) => (
  <Link
    href={`/blog/post/${post.id}`}
    data-console-blog-tile
    className={classes.blogTile}
  >
    <img
      className={classes.blogTileCover}
      src={post.cover.url}
      alt={post.cover.alt}
      loading={"lazy"}
    />
    <span className={classes.blogTileBody}>
      <span className={classes.blogTileTitle}>{post.title}</span>
      <span className={classes.blogExcerpt}>{post.excerpt}</span>
      <span className={classes.blogMeta}>
        <BlogAuthor userId={post.profileUserId} />
        <span className={classes.blogDate}>{formatDate(post.publishedAt)}</span>
      </span>
    </span>
  </Link>
);

/**
 * Console "what's new": up to four posts as same-size tiles, so the row stays
 * balanced with any count. Reused by the Xbox screens pack
 * (`XboxRecentBlogPostsCarousel`) with its own data; the console presenter
 * `ConsoleRecentBlogPosts` wires it to the shared blog query.
 */
const ConsoleBlogSection = ({
  posts,
  isLoading,
  isError,
  onRetry,
}: ConsoleBlogSectionProps) => {
  const { t } = useTranslation();
  const visible = posts?.slice(0, 4) ?? [];

  return (
    <section className={classes.blogSection} data-console-blog-section>
      <div className={classes.blogSectionHead}>
        <Text component="h2" className={classes.blogSectionTitle}>
          {t("blog.recentPosts")}
        </Text>
        <Link href={"/blog"} className={classes.blogSectionMore}>
          {t("blog.buttons.seeMore")}
          <IconChevronRight size={16} aria-hidden />
        </Link>
      </div>

      {isError && (
        <Button
          variant={"default"}
          onClick={onRetry}
          className={classes.blogRetry}
        >
          {t("blog.read.error")} {t("blog.read.retry")}
        </Button>
      )}
      {!isLoading && !isError && posts?.length === 0 && (
        <Text c={"dimmed"}>{t("blog.list.empty")}</Text>
      )}

      {(isLoading || visible.length > 0) && (
        <div className={classes.blogGrid}>
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <Skeleton
                  key={i}
                  className={`${classes.blogTile} ${classes.blogTileSkeleton}`}
                />
              ))
            : visible.map((post) => (
                <ConsoleBlogTile key={post.id} post={post} />
              ))}
        </div>
      )}
    </section>
  );
};

/** `RecentBlogPostsCarousel` console presenter: the same blog query as the default. */
const ConsoleRecentBlogPosts = () => {
  const { data, isLoading, error, refetch } = useBlogPosts({ limit: 6 });

  return (
    <ConsoleBlogSection
      posts={data?.data}
      isLoading={isLoading}
      isError={error != undefined && error != null}
      onRetry={() => {
        void refetch();
      }}
    />
  );
};

export {
  ConsoleBlogItem,
  ConsoleBlogSection,
  ConsoleBlogTile,
  ConsoleRecentBlogPosts,
};
