import React, { useEffect, useMemo } from "react";
import { Button, Fieldset, NumberInput, Stack, TextInput } from "@mantine/core";
import {
  CenteredLoading,
  createErrorNotification,
  useAwardEvent,
  useAwardEventCategories,
} from "@repo/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AwardsCategoryTranslationDto,
  AwardsService,
} from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";
import {
  createUpdateAwardsCategorySchema,
  CreateUpdateAwardsCategoryValues,
  DEFAULT_NOMINEE_COUNT,
  toTranslationsPayload,
} from "./schemas.ts";

interface Props {
  eventId: number;
  categoryId?: number;
}

const CreateUpdateAwardsCategoryForm = ({ eventId, categoryId }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUpdateAwardsCategoryValues>({
    mode: "onBlur",
    resolver: zodResolver(createUpdateAwardsCategorySchema),
    defaultValues: {
      nomineeCount: DEFAULT_NOMINEE_COUNT,
      nameEn: "",
      descriptionEn: "",
      namePtBR: "",
      descriptionPtBR: "",
    },
  });

  const queryClient = useQueryClient();

  const { data: event, isLoading: isEventLoading } = useAwardEvent({ eventId });

  const { data: eventCategories, isLoading: isEventCategoriesLoading } =
    useAwardEventCategories(eventId);

  const editingCategory = useMemo(() => {
    return eventCategories?.find((category) => category.id === categoryId);
  }, [eventCategories, categoryId]);

  const createUpdateMutation = useMutation({
    mutationFn: async (data: CreateUpdateAwardsCategoryValues) => {
      if (!event) {
        throw new Error("Event not found");
      }

      if (editingCategory?.isPersonalGOTY || editingCategory?.isGOTY) {
        throw new Error(
          "You cannot edit a Personal GOTY or GOTY category. These are used internally.",
        );
      }

      await AwardsService.awardsAdminControllerCreateUpdateCategoryV1({
        categoryId,
        year: event.year,
        name: data.name,
        description: data.description,
        order: data.order,
        nomineeCount: data.nomineeCount,
        translations: toTranslationsPayload(data),
      });
    },
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: `Category successfully ${categoryId ? "updated" : "created"}.`,
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["awards", "event", eventId, "categories"],
      });
    },
    onError: createErrorNotification,
  });

  useEffect(() => {
    if (eventCategories && !editingCategory) {
      setValue("order", eventCategories.length);
    }
  }, [editingCategory, eventCategories, setValue]);

  useEffect(() => {
    if (editingCategory) {
      setValue("name", editingCategory.name);
      setValue("description", editingCategory.description);
      setValue("order", editingCategory.order);
      setValue("nomineeCount", editingCategory.nomineeCount);

      const en = editingCategory.translations?.find(
        (translation) =>
          translation.locale === AwardsCategoryTranslationDto.locale.EN,
      );
      const ptBR = editingCategory.translations?.find(
        (translation) =>
          translation.locale === AwardsCategoryTranslationDto.locale.PT_BR,
      );

      setValue("nameEn", en?.name ?? "");
      setValue("descriptionEn", en?.description ?? "");
      setValue("namePtBR", ptBR?.name ?? "");
      setValue("descriptionPtBR", ptBR?.description ?? "");
    }
  }, [editingCategory, setValue]);

  if (isEventCategoriesLoading || isEventLoading) {
    return <CenteredLoading />;
  }

  return (
    <form
      onSubmit={handleSubmit((data) => {
        createUpdateMutation.mutate(data);
      })}
    >
      <Stack>
        <TextInput
          {...register("name")}
          label={"Name"}
          error={errors.name?.message}
        ></TextInput>
        <TextInput
          {...register("description")}
          label={"Description"}
          error={errors.description?.message}
        ></TextInput>
        <Fieldset legend={"English"}>
          <Stack>
            <TextInput
              {...register("nameEn")}
              label={"Name"}
              error={errors.nameEn?.message}
            ></TextInput>
            <TextInput
              {...register("descriptionEn")}
              label={"Description"}
              error={errors.descriptionEn?.message}
            ></TextInput>
          </Stack>
        </Fieldset>
        <Fieldset legend={"Portuguese (pt-BR)"}>
          <Stack>
            <TextInput
              {...register("namePtBR")}
              label={"Name"}
              error={errors.namePtBR?.message}
            ></TextInput>
            <TextInput
              {...register("descriptionPtBR")}
              label={"Description"}
              error={errors.descriptionPtBR?.message}
            ></TextInput>
          </Stack>
        </Fieldset>
        <NumberInput
          label={"Ordering"}
          description={
            "The ordering of this category. Lower values will push this category to the top of the list. Leave blank to use the default ordering, which is the number of categories already in the event, starting from 0."
          }
          min={0}
          max={undefined}
          value={watch("order")}
          onChange={(v) => {
            setValue("order", v as number);
          }}
          error={errors.order?.message}
        ></NumberInput>
        <NumberInput
          label={"Nominees"}
          description={
            "How many nominees the finalization keeps for this category. Defaults to 6."
          }
          min={1}
          allowDecimal={false}
          value={watch("nomineeCount")}
          onChange={(v) => {
            setValue("nomineeCount", v as number);
          }}
          error={errors.nomineeCount?.message}
        ></NumberInput>
        <Button
          type={"submit"}
          loading={createUpdateMutation.isPending}
          disabled={editingCategory?.isPersonalGOTY || editingCategory?.isGOTY}
        >
          Submit
        </Button>
      </Stack>
    </form>
  );
};

export { CreateUpdateAwardsCategoryForm };
