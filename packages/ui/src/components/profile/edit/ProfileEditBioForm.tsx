import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack, Textarea } from "@mantine/core";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useMutation } from "@tanstack/react-query";
import { ProfileService } from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";
import { createErrorNotification } from "#@/util";

const BioForm = z.object({
  bio: z.string().min(1).max(240),
});

type TBioForm = z.infer<typeof BioForm>;

const ProfileEditBioForm = () => {
  const userId = useUserId();
  const profile = useUserProfile(userId);
  const { register, handleSubmit, formState } = useForm<TBioForm>({
    mode: "onBlur",
    resolver: zodResolver(BioForm),
  });
  const profileMutation = useMutation({
    mutationFn: (values: TBioForm) => {
      return ProfileService.profileControllerUpdateV1({
        bio: values.bio,
      });
    },
    onError: createErrorNotification,
    onSuccess: () => {
      notifications.show({
        message: "Successfully updated your bio!",
        color: "green",
      });
      profile.invalidate();
    },
  });
  return (
    <form onSubmit={handleSubmit((values) => profileMutation.mutate(values))}>
      <Stack className={"w-full"}>
        <Textarea
          {...register("bio")}
          error={formState.errors.bio?.message}
          defaultValue={profile.data?.bio}
        ></Textarea>
        {formState.dirtyFields.bio && (
          <Button type={"submit"} loading={profileMutation.isPending}>
            Submit
          </Button>
        )}
      </Stack>
    </form>
  );
};

export { ProfileEditBioForm };
