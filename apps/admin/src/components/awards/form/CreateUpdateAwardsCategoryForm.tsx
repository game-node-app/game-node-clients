import React, { useEffect, useMemo } from "react";
import { z } from "zod";
import { Button, NumberInput, Stack, TextInput } from "@mantine/core";
import {
  CenteredLoading,
  createErrorNotification,
  useAwardEvent,
  useAwardEventCategories,
} from "@repo/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AwardsService } from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";

const CreateUpdateAwardsCategoryFormSchema = z.object({
  name: z.string(),
  description: z.string(),
  order: z.number(),
});

type CreateUpdateAwardsCategoryFormValues = z.infer<
  typeof CreateUpdateAwardsCategoryFormSchema
>;

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
  } = useForm<CreateUpdateAwardsCategoryFormValues>({
    mode: "onBlur",
    resolver: zodResolver(CreateUpdateAwardsCategoryFormSchema),
  });

  const queryClient = useQueryClient();

  const { data: event, isLoading: isEventLoading } = useAwardEvent({ eventId });

  const { data: eventCategories, isLoading: isEventCategoriesLoading } =
    useAwardEventCategories(eventId);

  const editingCategory = useMemo(() => {
    return eventCategories?.find((category) => category.id === categoryId);
  }, [eventCategories, categoryId]);

  const createUpdateMutation = useMutation({
    mutationFn: async (data: CreateUpdateAwardsCategoryFormValues) => {
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
        ...data,
        year: event.year,
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
