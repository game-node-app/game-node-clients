import { GamePlatformSelect, usePreferredPlatforms } from "#@/components";
import { BaseModalChildrenProps, createErrorNotification } from "#@/util";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Switch, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { PreferredPlatformService } from "@repo/wrapper/server";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { SessionAuth } from "#@/components/auth/SessionAuth";
import { z } from "zod";

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
  const { t } = useTranslation();
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
        title: t("notifications.titles.success"),
        message: platformId
          ? t("preferences.platforms.updateSuccess")
          : t("preferences.platforms.addSuccess"),
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
          label={t("preferences.platforms.platformLabel")}
          error={errors.platformId?.message}
        />
        <TextInput
          {...register("label")}
          label={t("preferences.platforms.labelField")}
          description={t("preferences.platforms.labelDescription")}
          error={errors.label?.message}
        ></TextInput>
        <Switch
          label={t("preferences.platforms.enabled")}
          {...register("isEnabled")}
          checked={watch("isEnabled")}
        ></Switch>
        <Button loading={editPlatformMutation.isPending} type={"submit"}>
          {t("actions.submit")}
        </Button>
      </form>
    </SessionAuth>
  );
};

export { EditPreferredPlatformForm };
