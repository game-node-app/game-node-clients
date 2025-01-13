import React, { useMemo } from "react";
import { CreateReportRequestDto, ReportService } from "@/wrapper/server";
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
    reportCategoryToDescription,
    reportCategoryToString,
} from "@/components/report/util/reportCategoryToString";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { z } from "zod";

const ReportCreateFormSchema = z.object({
    category: z
        .nativeEnum(CreateReportRequestDto.category)
        .default(CreateReportRequestDto.category.SPAM),
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
    const { register, watch, handleSubmit, setValue } =
        useForm<ReportCreateFormValues>({
            mode: "onSubmit",
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
                message:
                    "Error while sending your report. Please try again. If this persists, contact support.",
            });
        },
        onSuccess: () => {
            notifications.show({
                color: "green",
                message:
                    "Thank you for submitting your report! It will be reviewed by our moderators as soon as possible.",
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
                <Text className={"text-sm text-dimmed"}>
                    For auditing purposes, you need to generate a report before
                    issuing a possible suspension/ban on a user. This helps us
                    streamline a possible review process.
                </Text>
                <Select
                    withAsterisk
                    value={selectedCategory}
                    onChange={(v) => {
                        if (v) {
                            setValue(
                                "category",
                                v as CreateReportRequestDto.category,
                            );
                        }
                    }}
                    name={"category"}
                    allowDeselect={false}
                    label={"Report category"}
                    data={categorySelectOptions}
                    description={selectedCategoryDescription}
                />
                <Textarea
                    {...register("reason")}
                    label={"Reason"}
                    description={
                        "Optional. A detailed reason may help us decide in a possible review process."
                    }
                />
                <Text className={"text-dimmed text-sm"}>
                    The generated report may be handled by any GameNode
                    moderator or admin.
                </Text>
                <Button className={"mt-2"} type={"submit"}>
                    Submit report
                </Button>
            </Stack>
        </form>
    );
};

export default ReportCreateForm;
