import React, { useState } from "react";
import {
  Button,
  Card,
  Group,
  NumberInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { createErrorNotification } from "@repo/ui";
import { RecapService, RecapWindowDto } from "@repo/wrapper/server";
import {
  buildRecapEditionRequest,
  recapEditionFormSchema,
  RecapEditionFormValues,
} from "./schemas.ts";

const DEFAULT_VALUES: RecapEditionFormValues = {
  year: new Date().getUTCFullYear(),
  opensAt: null,
};

const RecapEditionCard = () => {
  const [savedWindow, setSavedWindow] = useState<RecapWindowDto | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecapEditionFormValues>({
    resolver: zodResolver(recapEditionFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const updateMutation = useMutation({
    mutationFn: (values: RecapEditionFormValues) => {
      const { year, body } = buildRecapEditionRequest(values);
      return RecapService.recapAdminControllerUpdateEditionV1(year, body);
    },
    onError: createErrorNotification,
    onSuccess: (window) => {
      setSavedWindow(window);
      notifications.show({
        message: "Recap edition saved successfully.",
        color: "green",
      });
    },
  });

  return (
    <Card withBorder radius={"md"} p={"md"}>
      <Stack>
        <Title order={5}>Retrospectiva</Title>
        <Text size={"sm"} c={"dimmed"}>
          Sets the UTC instant the year&apos;s Recap opens for users. The
          opening must fall inside the edition year.
        </Text>
        <form
          onSubmit={handleSubmit((values) => {
            updateMutation.mutate(values);
          })}
        >
          <Stack>
            <Group align={"flex-end"} grow>
              <NumberInput
                label={"Year"}
                allowDecimal={false}
                value={watch("year")}
                onChange={(v) => {
                  setValue("year", v as number);
                }}
                error={errors.year?.message}
              />
              <Controller
                control={control}
                name={"opensAt"}
                render={({ field }) => (
                  <DateTimePicker
                    label={"Opens at (UTC)"}
                    value={field.value}
                    onChange={(date) => {
                      field.onChange(date ? new Date(date) : null);
                    }}
                    error={errors.opensAt?.message}
                    clearable
                  />
                )}
              />
            </Group>
            <Group justify={"end"}>
              <Button type={"submit"} loading={updateMutation.isPending}>
                Save
              </Button>
            </Group>
            {savedWindow && (
              <Stack gap={0}>
                <Text size={"sm"} fw={500}>
                  Edition {savedWindow.year}
                </Text>
                <Text size={"sm"}>opensAt: {savedWindow.opensAt}</Text>
                <Text size={"sm"}>closesAt: {savedWindow.closesAt}</Text>
              </Stack>
            )}
          </Stack>
        </form>
      </Stack>
    </Card>
  );
};

export { RecapEditionCard };
