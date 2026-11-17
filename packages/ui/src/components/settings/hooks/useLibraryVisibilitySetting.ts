import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  isLibraryVisibilityLevel,
  type LibraryVisibilityLevel,
} from "#@/components/collection/collection-entry/visibility/LibraryVisibilityLevel";
import { invalidateOwnLibraryVisibilityQueries } from "#@/components/collection/collection-entry/visibility/invalidateOwnLibraryVisibilityQueries";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { createErrorNotification } from "#@/util";
import {
  ProfileResponseDto,
  ProfileService,
  UpdateProfileDto,
} from "@repo/wrapper/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const LEVEL_TO_DTO: Record<
  LibraryVisibilityLevel,
  UpdateProfileDto.libraryVisibility
> = {
  public: UpdateProfileDto.libraryVisibility.PUBLIC,
  followers: UpdateProfileDto.libraryVisibility.FOLLOWERS,
  private: UpdateProfileDto.libraryVisibility.PRIVATE,
};

/** A missing/unknown stored value reads as `public`, the server default. */
function normalizeLibraryVisibility(
  value: string | undefined,
): LibraryVisibilityLevel {
  return isLibraryVisibilityLevel(value) ? value : "public";
}

/**
 * The library visibility ceiling of the authenticated user and the mutation
 * that saves it (`PATCH /v1/profile`).
 *
 * The change is optimistic so the select follows the click; on failure the
 * profile snapshot is restored and an error is shown. On success the own
 * profile is updated with the confirmed value and every read filtered by
 * library visibility is invalidated, so open surfaces follow the new ceiling.
 */
export function useLibraryVisibilitySetting() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const profileQuery = useUserProfile(userId);
  const queryKey = profileQuery.queryKey;

  const mutation = useMutation({
    mutationFn: (visibility: LibraryVisibilityLevel) =>
      ProfileService.profileControllerUpdateV1({
        libraryVisibility: LEVEL_TO_DTO[visibility],
      }),
    onMutate: async (visibility) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ProfileResponseDto>(queryKey);

      if (previous) {
        queryClient.setQueryData<ProfileResponseDto>(queryKey, {
          ...previous,
          libraryVisibility: LEVEL_TO_DTO[
            visibility
          ] as ProfileResponseDto.libraryVisibility,
        });
      }

      return { previous };
    },
    onError: (error, _visibility, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      createErrorNotification(error);
    },
    onSuccess: (_data, visibility) => {
      queryClient.setQueryData<ProfileResponseDto>(
        queryKey,
        (previous) =>
          previous && {
            ...previous,
            libraryVisibility: LEVEL_TO_DTO[
              visibility
            ] as ProfileResponseDto.libraryVisibility,
          },
      );
      void invalidateOwnLibraryVisibilityQueries(queryClient, userId);
    },
  });

  return {
    visibility: normalizeLibraryVisibility(
      profileQuery.data?.libraryVisibility,
    ),
    hasProfile: profileQuery.data != undefined,
    isPending: mutation.isPending,
    setVisibility: mutation.mutate,
  };
}
