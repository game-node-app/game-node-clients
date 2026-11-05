import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { ProfileService } from "@repo/wrapper/server";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useFavoriteCollectionEntriesForUserId } from "#@/components/collection/collection-entry/hooks/useFavoriteCollectionEntriesForUserId";
import { useUpdateFavoriteStatusMutation } from "#@/components/collection/collection-entry/hooks/useUpdateFavoriteStatusMutation";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsComingSoonBadge } from "#@/components/settings/common/SettingsPill";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { SettingsProfileActionBar } from "#@/components/settings/tabs/profile/SettingsProfileActionBar";
import { SettingsProfileFavorites } from "#@/components/settings/tabs/profile/SettingsProfileFavorites";
import {
  getSettingsProfileInputClassNames,
  SettingsProfileField,
} from "#@/components/settings/tabs/profile/SettingsProfileField";
import { SettingsProfileImages } from "#@/components/settings/tabs/profile/SettingsProfileImages";
import { SettingsProfileUsernameField } from "#@/components/settings/tabs/profile/SettingsProfileUsernameField";
import { createErrorNotification } from "#@/util";

/** Server limit (`UpdateProfileDto.bio.maxLength`). */
const BIO_MAX_LENGTH = 240;

const createBioFormSchema = (
  t: ReturnType<typeof useTranslation<"common">>["t"],
) =>
  z.object({
    bio: z
      .string()
      .trim()
      .min(1, t("settings.profile.bio.errors.required"))
      .max(
        BIO_MAX_LENGTH,
        t("settings.profile.bio.errors.maxLength", { max: BIO_MAX_LENGTH }),
      ),
  });

type BioFormValues = z.infer<ReturnType<typeof createBioFormSchema>>;

/**
 * "Edit profile" tab. Three save paths, each matching its API:
 * - images: uploaded as soon as the crop is confirmed in their modal;
 * - username: its own "Change to @x" action (cooldown, uniqueness errors);
 * - bio and removed favorites: held locally and saved by the sticky
 *   "Save changes" bar, which only shows while something is pending.
 */
export function SettingsProfileTab() {
  const { t } = useTranslation();
  const userId = useUserId();
  const profileQuery = useUserProfile(userId);
  const displayNameId = useId();
  const bioId = useId();

  const hasProfile = profileQuery.data != undefined;
  const savedBio = profileQuery.data?.bio ?? "";
  const username = profileQuery.data?.username ?? "";

  const {
    register,
    control,
    reset,
    trigger,
    getValues,
    formState: { errors, isDirty: isBioDirty },
  } = useForm<BioFormValues>({
    resolver: zodResolver(createBioFormSchema(t)),
    defaultValues: { bio: savedBio },
  });

  // Keeps the field in sync with the saved bio (first load, after saving).
  useEffect(() => {
    if (hasProfile) reset({ bio: savedBio });
  }, [hasProfile, savedBio, reset]);

  const bio = useWatch({ control, name: "bio" }) ?? "";

  const [removedGameIds, setRemovedGameIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const bioMutation = useMutation({
    mutationFn: (bio: string) =>
      ProfileService.profileControllerUpdateV1({ bio }),
    onError: createErrorNotification,
    onSuccess: () => profileQuery.invalidate(),
  });
  // `gameInFavorites: true` makes every call unfavorite the given game id.
  const removeFavoriteMutation = useUpdateFavoriteStatusMutation(
    undefined,
    true,
  );
  // Same query the mutation above keeps active; used to await the refetch.
  const favoritesQuery = useFavoriteCollectionEntriesForUserId(userId);

  const hasChanges = isBioDirty || removedGameIds.length > 0;

  const discard = () => {
    reset({ bio: savedBio });
    setRemovedGameIds([]);
  };

  const save = async () => {
    if (isBioDirty && !(await trigger("bio"))) return;

    setIsSaving(true);
    const nextBio = getValues("bio").trim();
    const bioTask = isBioDirty
      ? bioMutation.mutateAsync(nextBio).then(
          () => true,
          () => false,
        )
      : Promise.resolve(true);
    const removalTasks = removedGameIds.map((gameId) =>
      removeFavoriteMutation.mutateAsync(gameId).then(
        () => null,
        () => gameId,
      ),
    );
    const [isBioSaved, removalResults] = await Promise.all([
      bioTask,
      Promise.all(removalTasks),
    ]);
    const failedRemovals = removalResults.filter(
      (gameId): gameId is number => gameId != null,
    );
    // Wait for the refetch so removed covers don't flash back in.
    if (failedRemovals.length < removedGameIds.length) {
      await favoritesQuery.invalidate();
    }

    if (isBioDirty && isBioSaved) reset({ bio: nextBio });
    setRemovedGameIds(failedRemovals);
    setIsSaving(false);

    if (isBioSaved && failedRemovals.length === 0) {
      notifications.show({
        color: "green",
        message: t("settings.profile.actions.saved"),
      });
    }
  };

  if (!userId) return null;

  return (
    <>
      <SettingsProfileImages userId={userId} />
      <SettingsSection title={t("settings.profile.info.title")}>
        <SettingsCard>
          <Stack gap={24} className={"p-5"}>
            {/* `Profile` has no display name yet. */}
            <SettingsProfileField
              label={t("settings.profile.displayName.label")}
              htmlFor={displayNameId}
              labelBadges={<SettingsComingSoonBadge />}
              help={t("settings.profile.displayName.help")}
              disabled
            >
              <TextInput
                id={displayNameId}
                disabled
                placeholder={username}
                radius={8}
                classNames={getSettingsProfileInputClassNames()}
              />
            </SettingsProfileField>
            <SettingsProfileUsernameField userId={userId} />
            <SettingsProfileField
              label={t("settings.profile.bio.label")}
              htmlFor={bioId}
              error={errors.bio?.message}
              help={t("settings.profile.bio.help")}
              counter={`${bio.length}/${BIO_MAX_LENGTH}`}
            >
              <Textarea
                id={bioId}
                {...register("bio")}
                disabled={!hasProfile}
                readOnly={isSaving}
                autosize
                minRows={3}
                maxRows={8}
                maxLength={BIO_MAX_LENGTH}
                radius={8}
                error={errors.bio != undefined}
                classNames={getSettingsProfileInputClassNames(
                  errors.bio != undefined,
                )}
              />
            </SettingsProfileField>
          </Stack>
        </SettingsCard>
      </SettingsSection>
      <SettingsProfileFavorites
        userId={userId}
        removedGameIds={removedGameIds}
        disabled={isSaving}
        onRemove={(gameId) =>
          setRemovedGameIds((previous) =>
            previous.includes(gameId) ? previous : [...previous, gameId],
          )
        }
      />
      {hasChanges && (
        <SettingsProfileActionBar
          saving={isSaving}
          onDiscard={discard}
          onSave={save}
        />
      )}
    </>
  );
}
