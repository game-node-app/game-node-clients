import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Fieldset,
  SegmentedControl,
  Stack,
  Switch,
  TextInput,
} from "@mantine/core";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { useUserLibrary } from "#@/components/library/hooks/useUserLibrary";
import { BaseModalChildrenProps } from "#@/util/types/modal-props";
import { Collection, CollectionsService } from "@repo/wrapper/server";
import { useCollection } from "#@/components/collection/hooks/useCollection";
import { useMutation } from "@tanstack/react-query";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import {
  EMatomoEventAction,
  EMatomoEventCategory,
  trackMatomoEvent,
} from "#@/util/trackMatomoEvent";
import { CollectionEntryStatusSelect, useOnMobile } from "#@/components";

const CreateCollectionFormSchema = z
  .object({
    name: z.string().min(3, "Collection must have a name.").max(50),
    description: z.string().optional(),
    isPublic: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isFinished: z.boolean().default(false),
    defaultEntryStatus: z.nativeEnum(Collection.defaultEntryStatus).nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.isFeatured && !data.isPublic) {
      ctx.addIssue({
        code: "custom",
        path: ["isFeatured"],
        message: "Featured collections must be public",
      });
    }
  });

type CreateCollectionFormValues = z.infer<typeof CreateCollectionFormSchema>;

interface ICollectionCreateOrUpdateFormProps extends BaseModalChildrenProps {
  collectionId: string | undefined | null;
}

const CollectionCreateOrUpdateForm = ({
  onClose,
  collectionId,
}: ICollectionCreateOrUpdateFormProps) => {
  const session = useSessionContext();
  const userId = session.loading ? undefined : session.userId;
  const userLibraryQuery = useUserLibrary(userId);
  const onMobile = useOnMobile();

  const collectionQuery = useCollection(collectionId);
  const existingCollection = collectionQuery.data;

  const { setValue, handleSubmit, register, formState, watch } =
    useForm<CreateCollectionFormValues>({
      resolver: zodResolver(CreateCollectionFormSchema),
      mode: "onChange",
      defaultValues: {
        isPublic: true,
        defaultEntryStatus: Collection.defaultEntryStatus.PLANNED,
      },
    });

  const defaultEntryStatus = watch("defaultEntryStatus");

  const collectionMutation = useMutation({
    mutationFn: async (data: CreateCollectionFormValues) => {
      if (existingCollection != undefined) {
        await CollectionsService.collectionsControllerUpdateV1(
          existingCollection.id,
          data,
        );
        return;
      }
      await CollectionsService.collectionsControllerCreateV1(data);
    },
    onSuccess: () => {
      if (onClose) {
        onClose();
      }

      if (existingCollection) {
        trackMatomoEvent(
          EMatomoEventCategory.Collection,
          EMatomoEventAction.Update,
          "Updated collection",
        );
      } else {
        trackMatomoEvent(
          EMatomoEventCategory.Collection,
          EMatomoEventAction.Create,
          "Created collection",
        );
      }
    },
    onSettled: () => {
      userLibraryQuery.invalidate();
      collectionQuery.invalidate();
    },
  });

  useEffect(() => {
    const possibleKeys = Object.keys(
      CreateCollectionFormSchema.innerType().shape,
    );
    if (existingCollection != undefined) {
      for (const [key, value] of Object.entries(existingCollection)) {
        if (possibleKeys.includes(key)) {
          setValue(key as never, value as never);
        }
      }
    }
  }, [existingCollection, setValue]);

  return (
    <form
      className="w-full h-full"
      onSubmit={handleSubmit((data) => collectionMutation.mutate(data))}
    >
      <Stack gap="lg">
        {collectionMutation.isError && (
          <CenteredErrorMessage message={collectionMutation.error.message} />
        )}
        <TextInput
          withAsterisk
          label={"Collection name"}
          placeholder={"🎮 Playing now"}
          error={formState.errors.name?.message}
          defaultValue={existingCollection?.name}
          {...register("name")}
        />
        <TextInput
          label={"Description"}
          placeholder={"Games I'm currently playing"}
          error={formState.errors.description?.message}
          defaultValue={existingCollection?.description}
          {...register("description")}
        />
        <Switch
          error={formState.errors.isPublic?.message}
          label={"Public collection"}
          description={"If this collections is visible to other users"}
          defaultChecked={existingCollection?.isPublic ?? true}
          {...register("isPublic")}
        />
        <Switch
          error={formState.errors.isFeatured?.message}
          label={"Featured collection"}
          description={
            "If this collections should be featured in your profile and library"
          }
          defaultChecked={existingCollection?.isFeatured}
          {...register("isFeatured")}
        />
        <Fieldset legend="Automation">
          <Switch
            label={"Enable automatic status for games"}
            error={formState.errors.isFinished?.message}
            description={
              "All games in this collection will be filled with the selected status when being added. Only affects new entries."
            }
            checked={defaultEntryStatus != null}
            onChange={(evt) => {
              setValue(
                "defaultEntryStatus",
                evt.currentTarget.checked
                  ? Collection.defaultEntryStatus.PLANNED
                  : null,
              );
            }}
          />
          {defaultEntryStatus != null && (
            <CollectionEntryStatusSelect
              selectedCollectionIds={[]}
              value={defaultEntryStatus}
              onChange={(v) => setValue("defaultEntryStatus", v as never)}
              orientation={onMobile ? "vertical" : "horizontal"}
            />
          )}
        </Fieldset>

        <Button
          type="submit"
          loading={collectionMutation.isPending || collectionQuery.isLoading}
          disabled={collectionQuery.isLoading}
        >
          {existingCollection ? "Update" : "Create"}
        </Button>
      </Stack>
    </form>
  );
};

export { CollectionCreateOrUpdateForm };
