import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Box,
  Button,
  ComboboxItem,
  Group,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { cn, createErrorNotification, downloadFile } from "#@/util";
import {
  AwardsEventCategoriesList,
  AwardsVoteLayout,
  useUserId,
} from "#@/components";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { IconDownload } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { toBlob } from "html-to-image";
import { useTranslation } from "@repo/locales";

const PREVIEW_ELEMENT_ID = "awards-share-preview";

const AwardsNomineesShareFormSchema = z.object({
  layout: z.string(),
});

export type AwardsNomineesShareFormValues = z.infer<
  typeof AwardsNomineesShareFormSchema
>;

interface Props {
  eventId: number;
  onShare: (file: File) => Promise<void>;
}

const AwardsNomineesShareForm = ({ eventId, onShare }: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const { handleSubmit, watch, register, setValue } =
    useForm<AwardsNomineesShareFormValues>({
      mode: "onBlur",
      resolver: zodResolver(AwardsNomineesShareFormSchema),
      defaultValues: {
        layout: "large",
      },
    });

  const layout = watch("layout");

  const layoutCols = layout === "compact" ? 3 : 5;

  const selectLayoutOptions: ComboboxItem[] = [
    { value: "compact", label: t("awards.layouts.compact") },
    { value: "large", label: t("awards.layouts.large") },
  ];

  const shareMutation = useMutation({
    mutationFn: async (downloadOnly: boolean = false) => {
      const node = document.getElementById(PREVIEW_ELEMENT_ID);
      const blob = await toBlob(node!, {
        fetchRequestInit: {
          method: "GET",
          cache: "no-cache", // <-- Important!
        },
      });
      if (!blob) {
        throw new Error("Failed to generate final image.");
      }
      // The blob always has 'image/jpeg' as mimetype.
      const extension = "jpeg";
      const filename = `gamenode-share-${eventId}-${new Date().getTime()}.${extension}`;
      const file = new File([blob], filename, {
        type: blob.type,
      });

      if (downloadOnly) {
        return downloadFile(file);
      }

      await onShare(file);
    },
    onError: createErrorNotification,
  });

  return (
    <SessionAuth>
      <form
        className={"w-full"}
        onSubmit={handleSubmit(() => {
          shareMutation.mutate(false);
        })}
      >
        <Stack>
          <Text>{t("awards.labels.preview")}</Text>
          <Text className={"text-sm text-dimmed"}>
            {t("awards.share.scrollHint")}
          </Text>
          <Box className={"w-full overflow-auto"}>
            <Box
              id={PREVIEW_ELEMENT_ID}
              className={cn({
                "min-w-[440px] w-[440px]": layout === "compact",
                "min-w-[1280px] w-[1280px]": layout === "large",
              })}
            >
              <AwardsVoteLayout
                userId={userId!}
                title={t("awards.labels.nominees")}
                eventId={eventId}
              >
                <AwardsEventCategoriesList
                  eventId={eventId}
                  userId={userId!}
                  cols={layoutCols}
                />
              </AwardsVoteLayout>
            </Box>
          </Box>
        </Stack>
        <Group className={"mt-10"}>
          <Select
            data={selectLayoutOptions}
            {...register("layout")}
            value={layout}
            onChange={(v) => {
              if (v) {
                setValue("layout", v);
              }
            }}
            allowDeselect={false}
            className={"w-fit"}
            label={t("awards.labels.layout")}
          />
        </Group>

        <Group className={"mt-10 justify-center"}>
          <Button type={"submit"} loading={shareMutation.isPending}>
            {t("actions.share")}
          </Button>
          <ActionIcon
            size={"lg"}
            loading={shareMutation.isPending}
            onClick={() => {
              shareMutation.mutate(true);
            }}
          >
            <IconDownload />
          </ActionIcon>
        </Group>
      </form>
    </SessionAuth>
  );
};

export { AwardsNomineesShareForm };
