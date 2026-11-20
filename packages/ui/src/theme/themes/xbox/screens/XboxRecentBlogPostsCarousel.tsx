import { useBlogPosts } from "#@/components/blog/hooks/useBlogPosts";
import { ConsoleBlogSection } from "#@/theme/experiences/console/ConsoleBlogSection";

/**
 * Xbox home blog block: the latest posts as a row of same-size tiles. The tiles
 * are the console experience's; this presenter exists so the Xbox screen pack
 * owns its home composition without importing the console barrel.
 */
const XboxRecentBlogPostsCarousel = () => {
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

export { XboxRecentBlogPostsCarousel };
