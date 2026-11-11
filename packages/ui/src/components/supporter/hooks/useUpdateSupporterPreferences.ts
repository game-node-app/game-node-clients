import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@repo/locales";
import {
  ApiError,
  ProfileService,
  type ProfileResponseDto,
  type SupporterPreferencesResponseDto,
  type UpdateSupporterPreferencesDto,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { createErrorNotification } from "#@/util";
import {
  getProfilePresenceQueryKey,
  SUPPORTERS_WALL_QUERY_KEY,
  SUPPORTER_PREFERENCES_MUTATION_KEY,
  SUPPORTER_QUERY_KEYS,
} from "./supporterQueryKeys";

type PreferenceField = keyof UpdateSupporterPreferencesDto;

interface UpdateSupporterPreferencesContext {
  /** The patched fields' previous values; other fields are never rolled back. */
  previous: Partial<SupporterPreferencesResponseDto> | null;
}

function pickPatchedFields(
  preferences: SupporterPreferencesResponseDto | null,
  patch: UpdateSupporterPreferencesDto,
): Partial<SupporterPreferencesResponseDto> | null {
  if (!preferences) return null;

  return Object.fromEntries(
    (Object.keys(patch) as PreferenceField[]).map((field) => [
      field,
      preferences[field as keyof SupporterPreferencesResponseDto],
    ]),
  ) as Partial<SupporterPreferencesResponseDto>;
}

/**
 * Partial save of the signed-in user's supporter preferences (design D8).
 *
 * Every control sends only its own field and is applied optimistically to the
 * shared `["userProfile", userId]` read, so the settings preview and the header
 * follow the change before the server answers. A failed request only rolls back
 * the fields it patched, leaving concurrent successful changes intact.
 */
export function useUpdateSupporterPreferences() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userId = useUserId();
  const profileQueryKey = ["userProfile", userId];

  return useMutation<
    SupporterPreferencesResponseDto,
    ApiError,
    UpdateSupporterPreferencesDto,
    UpdateSupporterPreferencesContext
  >({
    mutationKey: SUPPORTER_PREFERENCES_MUTATION_KEY,
    mutationFn: (patch) =>
      ProfileService.supporterPreferencesControllerUpdateV1(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: profileQueryKey });

      const currentPreferences =
        queryClient.getQueryData<ProfileResponseDto>(profileQueryKey)
          ?.supporterPreferences ?? null;
      const previous = pickPatchedFields(currentPreferences, patch);

      if (currentPreferences) {
        queryClient.setQueryData<ProfileResponseDto>(
          profileQueryKey,
          (old) =>
            old
              ? {
                  ...old,
                  supporterPreferences: {
                    ...currentPreferences,
                    ...patch,
                  } as SupporterPreferencesResponseDto,
                }
              : old,
        );
      }

      return { previous };
    },
    onError: (error, _patch, context) => {
      if (context?.previous && Object.keys(context.previous).length > 0) {
        queryClient.setQueryData<ProfileResponseDto>(
          profileQueryKey,
          (old) =>
            old?.supporterPreferences
              ? {
                  ...old,
                  supporterPreferences: {
                    ...old.supporterPreferences,
                    ...context.previous,
                  } as SupporterPreferencesResponseDto,
                }
              : old,
        );
      }

      if (error instanceof ApiError && error.status === 403) {
        notifications.show({
          color: "red",
          message: t("supporter.perks.errors.notSupporter"),
        });
        void queryClient.invalidateQueries({ queryKey: profileQueryKey });
        void queryClient.invalidateQueries({
          queryKey: SUPPORTER_QUERY_KEYS.me,
        });
        return;
      }

      createErrorNotification(error);
    },
    onSuccess: (result) => {
      queryClient.setQueryData<ProfileResponseDto>(
        profileQueryKey,
        (old) => (old ? { ...old, supporterPreferences: result } : old),
      );
    },
    onSettled: (_result, _error, patch) => {
      if ("showOnSupportersWall" in patch) {
        void queryClient.invalidateQueries({
          queryKey: SUPPORTERS_WALL_QUERY_KEY,
        });
      }

      if ("showLiveProfile" in patch) {
        queryClient.removeQueries({
          queryKey: getProfilePresenceQueryKey(userId),
        });
      }
    },
  });
}
