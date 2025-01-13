import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack, Textarea, TextInput } from "@mantine/core";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import useUserId from "@/components/auth/hooks/useUserId";
import { useMutation } from "@tanstack/react-query";
import { ProfileService } from "@/wrapper/server";
import { notifications } from "@mantine/notifications";

const BioForm = z.object({
    bio: z.string().min(1).max(240),
});

type TBioForm = z.infer<typeof BioForm>;

const ProfileEditBioForm = () => {
    const userId = useUserId();
    const profile = useUserProfile(userId);
    const { register, handleSubmit, formState, control } = useForm<TBioForm>({
        mode: "onBlur",
        resolver: zodResolver(BioForm),
    });
    const profileMutation = useMutation({
        mutationFn: (values: TBioForm) => {
            return ProfileService.profileControllerUpdateV1({
                bio: values.bio,
            });
        },
        onSuccess: () => {
            notifications.show({
                message: "Successfully updated your bio!",
                color: "green",
            });
        },
    });
    return (
        <form
            onSubmit={handleSubmit((values) => profileMutation.mutate(values))}
        >
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

export default ProfileEditBioForm;
