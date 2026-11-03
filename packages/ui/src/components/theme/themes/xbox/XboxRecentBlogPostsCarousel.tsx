import { useBlogPosts } from "#@/components/blog/hooks/useBlogPosts";
import { ConsoleBlogSection } from "#@/components/theme/console/ConsoleBlogSection";

/** Xbox home blog block: the latest post as a large card with the next ones beside it. */
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
