import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { createErrorNotification } from "@repo/ui";
import {
  AchievementEvent,
  AchievementsAdminService,
} from "@repo/wrapper/server";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ConfirmButton } from "./ConfirmButton";
import { useAdminEvent, useInvalidateAchievementCatalog } from "./hooks";
import { eventFormSchema, EventFormValues } from "./schemas";

const EventForm = ({ id }: { id: string }) => {
  const router = useRouter();
  const isNew = id === "new";
  const eventQuery = useAdminEvent(id);
  const event = eventQuery.data;
  const invalidate = useInvalidateAchievementCatalog();
  const isDraft = isNew || event?.status === AchievementEvent.status.DRAFT;
  const isArchived = event?.status === AchievementEvent.status.ARCHIVED;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: { slug: "", name: "", description: "" },
  });

  useEffect(() => {
    if (event) {
      reset({
        slug: event.slug,
        name: event.name,
        description: event.description,
        startsAt: new Date(event.startsAt),
        endsAt: new Date(event.endsAt),
      });
    }
  }, [event, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      const body = {
        ...data,
        startsAt: data.startsAt.toISOString(),
        endsAt: data.endsAt.toISOString(),
      };
      if (isNew) {
        return AchievementsAdminService.achievementsAdminControllerCreateEventV1(
          body,
        );
      }
      if (!isDraft && new Date(body.endsAt) <= new Date(event!.endsAt)) {
        throw new Error(
          "End can only be moved to a later date once published.",
        );
      }
      // Slug and start are locked after publishing.
      const { slug, startsAt, ...editable } = body;
      return AchievementsAdminService.achievementsAdminControllerUpdateEventV1(
        id,
        isDraft ? body : editable,
      );
    },
    onError: createErrorNotification,
    onSuccess: async (saved) => {
      await invalidate();
      notifications.show({ message: "Event saved.", color: "green" });
      if (isNew) await router.push(`/dashboard/achievement/events/${saved.id}`);
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (action: "publish" | "archive" | "delete") => {
      switch (action) {
        case "publish":
          return AchievementsAdminService.achievementsAdminControllerPublishEventV1(
            id,
          );
        case "archive":
          return AchievementsAdminService.achievementsAdminControllerArchiveEventV1(
            id,
          );
        case "delete":
          return AchievementsAdminService.achievementsAdminControllerDeleteEventV1(
            id,
          );
      }
    },
    onError: createErrorNotification,
    onSuccess: async (_, action) => {
      await invalidate();
      if (action === "delete") {
        await router.push("/dashboard/achievement/events");
      }
    },
  });

  return (
    <form
      className={"w-full"}
      onSubmit={handleSubmit((data) => saveMutation.mutate(data))}
    >
      <Stack className={"w-full relative"} maw={700}>
        <LoadingOverlay
          visible={
            eventQuery.isLoading ||
            saveMutation.isPending ||
            actionMutation.isPending
          }
        />
        {event && <Text>Status: {event.status}</Text>}
        <TextInput
          label={"Slug"}
          disabled={!isDraft}
          error={errors.slug?.message}
          {...register("slug")}
        />
        <TextInput
          label={"Name"}
          disabled={isArchived}
          error={errors.name?.message}
          {...register("name")}
        />
        <Textarea
          label={"Description"}
          disabled={isArchived}
          error={errors.description?.message}
          {...register("description")}
        />
        <Controller
          control={control}
          name={"startsAt"}
          render={({ field }) => (
            <DateTimePicker
              label={"Starts (UTC instant)"}
              disabled={!isDraft}
              value={field.value}
              onChange={(v) => field.onChange(v ? new Date(v) : undefined)}
              error={errors.startsAt?.message}
            />
          )}
        />
        <Controller
          control={control}
          name={"endsAt"}
          render={({ field }) => (
            <DateTimePicker
              label={"Ends (UTC instant)"}
              description={
                isDraft ? undefined : "Can only be extended once published."
              }
              disabled={isArchived}
              minDate={isDraft || !event ? undefined : new Date(event.endsAt)}
              value={field.value}
              onChange={(v) => field.onChange(v ? new Date(v) : undefined)}
              error={errors.endsAt?.message}
            />
          )}
        />
        {!isArchived && (
          <Group justify={"end"}>
            {!isNew && isDraft && (
              <>
                <ConfirmButton
                  label={"Delete draft"}
                  color={"red"}
                  message={"Delete this draft event?"}
                  onConfirm={() => actionMutation.mutate("delete")}
                />
                <ConfirmButton
                  label={"Publish"}
                  message={
                    "Publishing makes the event visible. Its start becomes read-only and its end can only be extended."
                  }
                  onConfirm={() => actionMutation.mutate("publish")}
                />
              </>
            )}
            {!isNew && !isDraft && (
              <ConfirmButton
                label={"Archive"}
                color={"red"}
                message={"Archive this event?"}
                onConfirm={() => actionMutation.mutate("archive")}
              />
            )}
            <Button type={"submit"}>Save</Button>
          </Group>
        )}
      </Stack>
    </form>
  );
};

export { EventForm };