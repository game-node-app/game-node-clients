import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Fieldset, Stack, Switch, TextInput } from "@mantine/core";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { useUserLibrary } from "#@/components/library/hooks/useUserLibrary";
import { BaseModalChildrenProps } from "#@/util/types/modal-props";
import { Collection, CollectionsService } from "@repo/wrapper/server";
import { useCollection } from "#@/components/collection/hooks/useCollection";
import { useMutation } from "@tanstack/react-query";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { CollectionEntryStatusSelect, useOnMobile } from "#@/components";
import { notifications } from "@mantine/notifications";
import { createErrorNotification, syncEntityToZodForm } from "#@/util";
import { useTranslation } from "@repo/locales";

const createCollectionFormSchema = (
  t: ReturnType<typeof useTranslation>["t"],
) =>
  z
    .object({
      name: z.string().min(3, t("collection.labels.name")).max(50),
      description: z.string().optional(),
      isPublic: z.boolean(),
      isFeatured: z.boolean(),
      defaultEntryStatus: z.enum(Collection.defaultEntryStatus).nullable(),
    })
    .superRefine((data, ctx) => {
      if (data.isFeatured && !data.isPublic) {
        ctx.addIssue({
          code: "custom",
          path: ["isFeatured"],
          message: t("collection.validation.featuredMustBePublic"),
        });
      }
    });

type CreateCollectionFormValues = z.infer<
  ReturnType<typeof createCollectionFormSchema>
>;

interface ICollectionCreateOrUpdateFormProps extends BaseModalChildrenProps {
  collectionId: string | undefined | null;
}

const CollectionCreateOrUpdateForm = ({
  onClose,
  collectionId,
}: ICollectionCreateOrUpdateFormProps) => {
  const { t } = useTranslation();
  const session = useSessionContext();
  const userId = session.loading ? undefined : session.userId;
  const userLibraryQuery = useUserLibrary(userId);
  const onMobile = useOnMobile();

  const collectionQuery = useCollection(collectionId);
  const existingCollection = collectionQuery.data;

  const schema = React.useMemo(() => createCollectionFormSchema(t), [t]);

  const { setValue, handleSubmit, register, formState, watch, reset } =
    useForm<CreateCollectionFormValues>({
      resolver: zodResolver(schema),
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
      notifications.show({
        color: "green",
        message:
          collectionId != undefined
            ? t("collection.messages.updateSuccess")
            : t("collection.messages.createSuccess"),
      });
      if (onClose) {
        onClose();
      }
    },
    onError: createErrorNotification,
    onSettled: () => {
      userLibraryQuery.invalidate();
      collectionQuery.invalidate();
    },
  });

  useEffect(() => {
    if (existingCollection != undefined) {
      syncEntityToZodForm(existingCollection, schema, reset);
    }
  }, [existingCollection, reset, schema]);

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
          label={t("collection.labels.name")}
          placeholder={t("collection.placeholders.name")}
          error={formState.errors.name?.message}
          defaultValue={existingCollection?.name}
          {...register("name")}
        />
        <TextInput
          label={t("collection.labels.description")}
          placeholder={t("collection.placeholders.description")}
          error={formState.errors.description?.message}
          defaultValue={existingCollection?.description}
          {...register("description")}
        />
        <Switch
          error={formState.errors.isPublic?.message}
          label={t("collection.labels.public")}
          description={t("collection.descriptions.public")}
          defaultChecked={existingCollection?.isPublic ?? true}
          {...register("isPublic")}
        />
        <Switch
          error={formState.errors.isFeatured?.message}
          label={t("collection.labels.featured")}
          description={t("collection.descriptions.featured")}
          defaultChecked={existingCollection?.isFeatured}
          {...register("isFeatured")}
        />
        <Fieldset legend={t("collection.labels.automation")}>
          <Switch
            label={t("collection.labels.enableAutoStatus")}
            error={formState.errors.defaultEntryStatus?.message}
            description={t("collection.descriptions.autoStatus")}
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
          {existingCollection ? t("actions.update") : t("actions.create")}
        </Button>
      </Stack>
    </form>
  );
};

export { CollectionCreateOrUpdateForm };
