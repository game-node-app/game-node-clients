import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AchievementsAdminService } from "@repo/wrapper/server";

const KEY = ["achievements", "admin"];

export const useAdminMetrics = () =>
  useQuery({
    queryKey: [...KEY, "metrics"],
    queryFn: () =>
      AchievementsAdminService.achievementsAdminControllerGetMetricsV1(),
  });

export const useAdminDefinitions = () =>
  useQuery({
    queryKey: [...KEY, "definitions"],
    queryFn: () =>
      AchievementsAdminService.achievementsAdminControllerFindDefinitionsV1(),
  });

export const useAdminDefinition = (id: string | undefined) =>
  useQuery({
    queryKey: [...KEY, "definitions", id],
    queryFn: () =>
      AchievementsAdminService.achievementsAdminControllerFindDefinitionV1(id!),
    enabled: !!id && id !== "new",
  });

export const useAdminEvents = () =>
  useQuery({
    queryKey: [...KEY, "events"],
    queryFn: () =>
      AchievementsAdminService.achievementsAdminControllerFindEventsV1(),
  });

export const useAdminEvent = (id: string | undefined) =>
  useQuery({
    queryKey: [...KEY, "events", id],
    queryFn: () =>
      AchievementsAdminService.achievementsAdminControllerFindEventV1(id!),
    enabled: !!id && id !== "new",
  });

/** Refetches the admin queries and the public catalog viewers see (both live under "achievements"). */
export const useInvalidateAchievementCatalog = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["achievements"] });
};
