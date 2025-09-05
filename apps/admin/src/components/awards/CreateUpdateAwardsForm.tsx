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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import { createErrorNotification, useAwardEvent } from "@repo/ui";

const CreateAwardsFormSchema = z.object({
  year: z.number(),
  votingStartDate: z.date(),
  votingEndDate: z.date(),
  resultsDate: z.date(),
});

type CreateAwardsFormValues = z.infer<typeof CreateAwardsFormSchema>;

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
  } = useForm<CreateAwardsFormValues>({
    resolver: zodResolver(CreateAwardsFormSchema),
    mode: "onSubmit",
  });

  const createUpdateMutation = useMutation({
    mutationFn: async (data: CreateAwardsFormValues) => {
      await AwardsService.awardsAdminControllerCreateOrUpdateEventV1({
        eventId: eventId,
        year: data.year,
        votingStartDate: data.votingStartDate.toISOString(),
        votingEndDate: data.votingEndDate.toISOString(),
        resultsDate: data.resultsDate.toISOString(),
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
              setValue("votingStartDate", date);
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
              setValue("votingEndDate", date);
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
              setValue("resultsDate", date);
            }
          }}
          error={errors.votingEndDate?.message}
          label={"Results Publish"}
          description={"The date the results will be published."}
        />
        <Flex justify={"end"}>
          <Button type={"submit"}>Save</Button>
        </Flex>
      </Stack>
    </form>
  );
};

export { CreateUpdateAwardsForm };
