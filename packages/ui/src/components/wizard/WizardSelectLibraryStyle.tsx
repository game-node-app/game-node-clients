import React, { useEffect } from "react";
import {
  useCollectionEntriesForUserId,
  useUserId,
  useUserLibrary,
} from "#@/components";
import { Button, Center, Group, Radio, Stack, Title } from "@mantine/core";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseModalChildrenProps, createErrorNotification } from "#@/util";
import { useMutation } from "@tanstack/react-query";
import { CollectionsService } from "@repo/wrapper/server";

const SelectLibraryStyleForm = z.object({
  selectedStyle: z.union([z.literal("categorized"), z.literal("single")]),
});

type SelectLibraryStyleFormValues = z.infer<typeof SelectLibraryStyleForm>;

interface Props extends BaseModalChildrenProps {
  onSkip: () => void;
}

const WizardSelectLibraryStyle = ({ onSkip, onClose }: Props) => {
  const userId = useUserId();
  const libraryQuery = useUserLibrary(userId);
  const {
    watch,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SelectLibraryStyleFormValues>({
    resolver: zodResolver(SelectLibraryStyleForm),
    mode: "onSubmit",
    defaultValues: {
      selectedStyle: "categorized",
    },
  });

  const collectionsEntryQuery = useCollectionEntriesForUserId(userId!, 0, 1);

  const selectedStyle = watch("selectedStyle");

  const libraryStyleMutation = useMutation({
    mutationFn: async (data: SelectLibraryStyleFormValues) => {
      if (data.selectedStyle !== "single") {
        return;
      }
      if (libraryQuery.data == undefined) {
        return;
      }

      for (const collection of libraryQuery.data?.collections) {
        await CollectionsService.collectionsControllerDeleteV1(collection.id);
      }

      await CollectionsService.collectionsControllerCreateV1({
        name: "Library",
        description: "All my games.",
        isFeatured: true,
        isFinished: false,
        isPublic: true,
      });
    },
    onError: createErrorNotification,
    onSuccess: () => {
      onClose?.();
    },
  });

  useEffect(() => {
    const allowCollectionsDeletion =
      collectionsEntryQuery.data?.pagination.totalItems === 0;

    if (
      userId &&
      collectionsEntryQuery.data != undefined &&
      !allowCollectionsDeletion
    ) {
      setError("selectedStyle", {
        type: "disabled",
        message:
          "Disabled because you already have have games added to your library.",
      });
    }
  }, [
    collectionsEntryQuery.data,
    collectionsEntryQuery.data?.pagination.totalItems,
    setError,
    userId,
  ]);

  return (
    <SessionAuth>
      <form
        className={"flex w-full justify-center flex-wrap"}
        onSubmit={handleSubmit((data) => libraryStyleMutation.mutate(data))}
      >
        <Stack className={"w-full items-center lg:max-w-[40vw]"}>
          <Title>What&apos;s your style?</Title>
          <Group
            className={
              "w-full justify-center lg:justify-between lg:flex-nowrap h-56"
            }
          >
            <Center className={"bg-[#181818] p-4 lg:w-80 lg:h-full"}>
              <Radio
                className={"w-full"}
                label={"I prefer my games categorized"}
                description={
                  "We will keep the 5 default collections in your library. No changes will be made."
                }
                checked={selectedStyle === "categorized"}
                onChange={() => setValue("selectedStyle", "categorized")}
              />
            </Center>
            <Center className={"bg-[#181818] p-4 lg:w-80 lg:h-full"}>
              <Radio
                className={"w-full"}
                label={"I like to keep everything in one place"}
                description={
                  "We will create a single collection called 'Library', and it will be automatically " +
                  "selected when you try to add a game. You can still create more collections later. " +
                  "Warning: This will delete all default collections!"
                }
                checked={selectedStyle === "single"}
                onChange={() => setValue("selectedStyle", "single")}
                disabled={errors.selectedStyle?.message != undefined}
                error={errors.selectedStyle?.message}
              />
            </Center>
          </Group>
        </Stack>
        <Group className={"w-full justify-end mt-10"}>
          <Button
            color={"teal"}
            className={"w-28"}
            type={"button"}
            onClick={onSkip}
          >
            Skip
          </Button>
          <Button
            className={"w-28"}
            loading={libraryStyleMutation.isPending}
            type={"submit"}
            disabled={libraryStyleMutation.isPending}
          >
            Submit
          </Button>
        </Group>
      </form>
    </SessionAuth>
  );
};

export { WizardSelectLibraryStyle };
