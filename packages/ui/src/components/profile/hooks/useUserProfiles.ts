import { useQuery } from "@tanstack/react-query";
import { ProfileService } from "@repo/wrapper/server";

export function useUserProfiles() {
  return useQuery({
    queryKey: ["userProfile", "all"],
    queryFn: async () => {
      return ProfileService.profileControllerFindAllV1();
    },
    retry: 2,
  });
}
