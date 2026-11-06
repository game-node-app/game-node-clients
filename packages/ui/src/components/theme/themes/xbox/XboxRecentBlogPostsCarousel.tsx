import { useBlogPosts } from "#@/components/blog/hooks/useBlogPosts";
import { ConsoleBlogSection } from "#@/components/theme/console/ConsoleBlogSection";

/** Xbox home blog block: the latest posts as a row of same-size tiles. */
const XboxRecentBlogPostsCarousel = () => {
  const { data, isLoading, error, refetch } = useBlogPosts({ limit: 6 });

  return (
    <ConsoleBlogSection
      posts={data?.data}
      isLoading={isLoading}
      isError={error != undefined}
      onRetry={refetch}
    />
  );
};

export { XboxRecentBlogPostsCarousel };
