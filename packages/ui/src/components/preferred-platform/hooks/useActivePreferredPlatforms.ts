import { usePreferredPlatforms } from "#@/components";

export function useActivePreferredPlatforms() {
  const { data, ...others } = usePreferredPlatforms();

  const filteredData = data?.filter((platform) => platform.enabled);

  return {
    data: filteredData,
    ...others,
  };
}
