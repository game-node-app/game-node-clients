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

/**
 * Xbox "what's new": the latest post as a large card, the next three as a compact list.
 * Replaces the blog carousel on the Xbox theme (see RecentBlogPostsCarousel).
 */
const ConsoleBlogSection = ({ posts, isLoading, isError, onRetry }: Props) => {
  const { t } = useTranslation();
  const [featured, ...others] = posts ?? [];

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

      {(isLoading || featured) && (
        <div className={"gn-blog-grid"}>
          {isLoading ? (
            <>
              <Skeleton className={"gn-blog-feature"} />
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className={"gn-blog-item"} />
              ))}
            </>
          ) : (
            <>
              <Link
                href={`/blog/post/${featured.id}`}
                className={"gn-blog-feature"}
              >
                <img
                  className={"gn-blog-feature-cover"}
                  src={featured.cover.url}
                  alt={""}
                  loading={"lazy"}
                />
                <span className={"gn-blog-feature-body"}>
                  <span className={"gn-blog-feature-title"}>
                    {featured.title}
                  </span>
                  <span className={"gn-blog-excerpt"}>{featured.excerpt}</span>
                  <span className={"gn-blog-meta"}>
                    <Author userId={featured.profileUserId} />
                    <span className={"gn-blog-date"}>
                      {formatDate(featured.publishedAt)}
                    </span>
                  </span>
                </span>
              </Link>
              {others.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/post/${post.id}`}
                  className={"gn-blog-item"}
                >
                  <img
                    className={"gn-blog-item-cover"}
                    src={post.cover.url}
                    alt={""}
                    loading={"lazy"}
                  />
                  <span className={"gn-blog-item-body"}>
                    <span className={"gn-blog-item-title"}>{post.title}</span>
                    <span className={"gn-blog-date"}>
                      {formatDate(post.publishedAt)}
                    </span>
                  </span>
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </section>
  );
};

export { ConsoleBlogSection };
