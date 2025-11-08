import React, { useEffect } from "react";
import {
  BaseModalChildrenProps,
  BaseModalProps,
  createErrorNotification,
  Modal,
  syncEntityToZodForm,
} from "#@/util";
import {
  GamePlatformSelect,
  usePreferredPlatforms,
  useUserId,
} from "#@/components";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { Button, Stack, Switch, TextInput } from "@mantine/core";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { PreferredPlatformService } from "@repo/wrapper/server";
import { data } from "autoprefixer";

const EditPreferredPlatformFormSchema = z.object({
  platformId: z.number().min(1, "Platform is required"),
  label: z.string().max(120).optional(),
  isEnabled: z.boolean(),
});

type EditPreferredPlatformFormValues = z.infer<
  typeof EditPreferredPlatformFormSchema
>;

interface Props extends BaseModalChildrenProps {
  platformId?: number;
}

const EditPreferredPlatformForm = ({ platformId, onClose }: Props) => {
  const { invalidate, data: preferredPlatforms } = usePreferredPlatforms();
  const {
    watch,
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPreferredPlatformFormValues>({
    resolver: zodResolver(EditPreferredPlatformFormSchema),
    defaultValues: {
      platformId: platformId ?? 0,
      label: undefined,
      isEnabled: true,
    },
  });

  const editPlatformMutation = useMutation({
    mutationFn: async (data: EditPreferredPlatformFormValues) => {
      await PreferredPlatformService.preferredPlatformControllerCreateOrUpdateV1(
        {
          isEnabled: data.isEnabled,
          label: data.label,
          platformId: data.platformId,
        },
      );
    },
    onSuccess: () => {
      notifications.show({
        color: "green",
        title: "Success",
        message: `Preferred platform has been ${
          platformId ? "updated" : "added"
        } successfully.`,
      });
      onClose?.();
    },
    onError: createErrorNotification,
    onSettled: () => {
      invalidate();
    },
  });

  useEffect(() => {
    if (platformId) {
      const targetPlatform = preferredPlatforms?.find(
        (plat) => plat.platformId === platformId,
      );
      if (targetPlatform) {
        console.log("Syncing platform data to form", targetPlatform);
        reset({
          platformId: targetPlatform.platformId,
          label: targetPlatform.label ?? undefined,
          isEnabled: targetPlatform.enabled,
        });
      }
    }
  }, [platformId, preferredPlatforms, reset]);

  return (
    <SessionAuth>
      <form
        className={"gap-4 flex flex-col"}
        onSubmit={handleSubmit((data) => {
          console.log(data);
          editPlatformMutation.mutate(data);
        })}
      >
        <GamePlatformSelect
          {...register("platformId")}
          value={watch("platformId")}
          withAsterisk
          onChange={(v) => {
            setValue("platformId", (v as number) ?? 0);
          }}
          label={"Platform"}
          error={errors.platformId?.message}
        />
        <TextInput
          {...register("label")}
          label={"Label"}
          description={
            "Optional. This helps you identify this platform. It doesn't affect functionality. Only shown to you."
          }
          error={errors.label?.message}
        ></TextInput>
        <Switch
          label={"Enabled"}
          {...register("isEnabled")}
          checked={watch("isEnabled")}
        ></Switch>
        <Button loading={editPlatformMutation.isPending} type={"submit"}>
          Submit
        </Button>
      </form>
    </SessionAuth>
  );
};

export { EditPreferredPlatformForm };
