import React, { useEffect } from "react";
import {
  Button,
  Flex,
  LoadingOverlay,
  NumberInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AwardsService } from "@repo/wrapper/server";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import { createErrorNotification, useAwardEvent } from "@repo/ui";
import dayjs from "dayjs";
import {
  createUpdateAwardsEventSchema,
  CreateUpdateAwardsEventValues,
} from "./schemas.ts";

interface Props {
  eventId?: number;
}

const CreateUpdateAwardsForm = ({ eventId }: Props) => {
  const queryClient = useQueryClient();

  const { data: editingEvent } = useAwardEvent({ eventId });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUpdateAwardsEventValues>({
    resolver: zodResolver(createUpdateAwardsEventSchema),
    mode: "onSubmit",
  });

  const createUpdateMutation = useMutation({
    mutationFn: async (data: CreateUpdateAwardsEventValues) => {
      await AwardsService.awardsAdminControllerCreateOrUpdateEventV1({
        eventId: eventId,
        year: data.year,
        votingStartDate: data.votingStartDate.toISOString(),
        votingEndDate: data.votingEndDate.toISOString(),
        resultsDate: data.resultsDate.toISOString(),
        nominationStartDate: data.nominationStartDate?.toISOString() ?? null,
        nominationEndDate: data.nominationEndDate?.toISOString() ?? null,
        eligibilityCutoffDate: data.eligibilityCutoffDate?.toISOString() ?? null,
      });
    },
    onError: createErrorNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["awards"],
      });
      notifications.show({
        message: "Event saved successfully.",
        color: "green",
      });
    },
  });

  useEffect(() => {
    if (editingEvent) {
      setValue("year", editingEvent.year);
      setValue("votingStartDate", new Date(editingEvent.votingStartDate));
      setValue("votingEndDate", new Date(editingEvent.votingEndDate));
      setValue("resultsDate", new Date(editingEvent.resultsDate));
      setValue(
        "nominationStartDate",
        editingEvent.nominationStartDate
          ? new Date(editingEvent.nominationStartDate)
          : null,
      );
      setValue(
        "nominationEndDate",
        editingEvent.nominationEndDate
          ? new Date(editingEvent.nominationEndDate)
          : null,
      );
      setValue(
        "eligibilityCutoffDate",
        editingEvent.eligibilityCutoffDate
          ? new Date(editingEvent.eligibilityCutoffDate)
          : null,
      );
    }
  }, [editingEvent, setValue]);

  return (
    <form
      className={"w-full"}
      onSubmit={handleSubmit((data) => {
        createUpdateMutation.mutate(data);
      })}
    >
      <Stack className={"w-full relative"}>
        <LoadingOverlay visible={createUpdateMutation.isPending} />
        {eventId && (
          <TextInput label={"ID"} value={eventId} disabled></TextInput>
        )}
        <NumberInput
          value={watch("year")}
          onChange={(v) => setValue("year", v as number)}
          error={errors.year?.message}
          label={"Year"}
          description={"The year this event will take place in."}
        />
        <DateTimePicker
          {...register("votingStartDate")}
          value={watch("votingStartDate")}
          onChange={(date) => {
            if (date) {
              setValue("votingStartDate", dayjs(date).toDate());
            }
          }}
          error={errors.votingStartDate?.message}
          label={"Voting Start"}
          description={
            "Voting start. Event will be visible and accessible to users at this date."
          }
        />
        <DateTimePicker
          {...register("votingEndDate")}
          value={watch("votingEndDate")}
          onChange={(date) => {
            if (date) {
              setValue("votingEndDate", dayjs(date).toDate());
            }
          }}
          error={errors.votingEndDate?.message}
          description={
            "The date the voting will end. Results will be CALCULATED at this date."
          }
          label={"Voting End"}
        />
        <DateTimePicker
          {...register("resultsDate")}
          value={watch("resultsDate")}
          onChange={(date) => {
            if (date) {
              setValue("resultsDate", dayjs(date).toDate());
            }
          }}
          error={errors.resultsDate?.message}
          label={"Results Publish"}
          description={"The date the results will be published."}
        />
        <DateTimePicker
          {...register("nominationStartDate")}
          value={watch("nominationStartDate")}
          onChange={(date) => {
            setValue("nominationStartDate", date ? dayjs(date).toDate() : null);
          }}
          error={errors.nominationStartDate?.message}
          label={"Nominations Start"}
          description={
            "Optional. Community nominations open at this date. Fill both nomination dates or leave both empty."
          }
          clearable
        />
        <DateTimePicker
          {...register("nominationEndDate")}
          value={watch("nominationEndDate")}
          onChange={(date) => {
            setValue("nominationEndDate", date ? dayjs(date).toDate() : null);
          }}
          error={errors.nominationEndDate?.message}
          label={"Nominations End"}
          description={
            "Optional. Community nominations close at this date. It must not be after the voting start."
          }
          clearable
        />
        <DateTimePicker
          {...register("eligibilityCutoffDate")}
          value={watch("eligibilityCutoffDate")}
          onChange={(date) => {
            setValue(
              "eligibilityCutoffDate",
              date ? dayjs(date).toDate() : null,
            );
          }}
          error={errors.eligibilityCutoffDate?.message}
          label={"Eligibility Cutoff"}
          description={
            "Optional. Games released after this date are not eligible for the event."
          }
          clearable
        />
        <Flex justify={"end"}>
          <Button type={"submit"}>Save</Button>
        </Flex>
      </Stack>
    </form>
  );
};

export { CreateUpdateAwardsForm };
