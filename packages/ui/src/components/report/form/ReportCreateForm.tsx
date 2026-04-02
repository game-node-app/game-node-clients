import React, { useMemo } from "react";
import { CreateReportRequestDto, ReportService } from "@repo/wrapper/server";
import { useForm } from "react-hook-form";
import {
  Button,
  ComboboxItem,
  Select,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import {
  reportCategoryToString,
  reportCategoryToDescription,
} from "#@/components/report/util/reportCategoryToString";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@repo/locales";

const ReportCreateFormSchema = z.object({
  category: z.enum(CreateReportRequestDto.category),
  reason: z.string().optional(),
});

type ReportCreateFormValues = z.infer<typeof ReportCreateFormSchema>;

export interface ReportCreateFormProps {
  sourceId: string;
  sourceType: CreateReportRequestDto.sourceType;
  onSuccess?: () => void;
}

const ReportCreateForm = ({
  sourceId,
  sourceType,
  onSuccess,
}: ReportCreateFormProps) => {
  const { t } = useTranslation();
  const { register, watch, handleSubmit, setValue } =
    useForm<ReportCreateFormValues>({
      mode: "onSubmit",
      resolver: zodResolver(ReportCreateFormSchema),
      defaultValues: {
        reason: undefined,
        category: CreateReportRequestDto.category.SPAM,
      },
    });

  const categorySelectOptions = useMemo<ComboboxItem[]>(() => {
    return Object.values(CreateReportRequestDto.category).map((v) => {
      return {
        label: reportCategoryToString(v),
        value: v,
      };
    });
  }, []);

  const selectedCategory = watch("category");

  const selectedCategoryDescription = useMemo(() => {
    return reportCategoryToDescription(selectedCategory);
  }, [selectedCategory]);

  const reportCreateMutation = useMutation({
    mutationFn: async (data: ReportCreateFormValues) => {
      await ReportService.reportControllerCreateV1({
        sourceId,
        sourceType,
        category: data.category,
        reason: data.reason,
      });
    },
    onError: () => {
      notifications.show({
        color: "red",
        message: t("reports.messages.error"),
      });
    },
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: t("reports.messages.success"),
      });

      if (onSuccess) onSuccess();
    },
  });

  return (
    <form
      className={"w-full h-full"}
      onSubmit={handleSubmit((data) => reportCreateMutation.mutate(data))}
    >
      <Stack className={"w-full h-full"}>
        <Select
          withAsterisk
          value={selectedCategory}
          onChange={(v) => {
            if (v) {
              setValue("category", v as CreateReportRequestDto.category);
            }
          }}
          name={"category"}
          allowDeselect={false}
          label={t("reports.labels.category")}
          data={categorySelectOptions}
          description={selectedCategoryDescription}
        />
        <Textarea
          {...register("reason")}
          label={t("reports.labels.reason")}
          description={t("reports.descriptions.reason")}
        />
        <Text className={"text-dimmed text-sm"}>
          {t("reports.descriptions.privacy")}
        </Text>
        <Button className={"mt-2"} type={"submit"}>
          {t("reports.buttons.submit")}
        </Button>
      </Stack>
    </form>
  );
};

export { ReportCreateForm };
