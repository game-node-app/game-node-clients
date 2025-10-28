import React from "react";
import { ActionIcon, Button, Chip, Group, Stack, Text } from "@mantine/core";
import { FieldPath, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { GAME_INFO_SHARE_PREVIEW_ID } from "#@/components";
import { toBlob } from "html-to-image";
import GameInfoSharePreview from "./GameInfoSharePreview";
import { IconDownload } from "@tabler/icons-react";
import { createErrorNotification, downloadFile } from "#@/util";

interface GameInfoShareProps {
  gameId: number;
  /**
   * The function called when the user clicks the SHARE button.
   * Should throw errors if share is not possible.
   * @param file
   */
  onShare: (file: File) => Promise<void>;
}

const ShareFormSchema = z.object({
  withRating: z.boolean(),
  withOwnedPlatforms: z.boolean(),
  transparentBackground: z.boolean(),
  withDivider: z.boolean(),
});

export type ShareFormValues = z.infer<typeof ShareFormSchema>;

const GameInfoShare = ({ gameId, onShare }: GameInfoShareProps) => {
  const { watch, setValue, handleSubmit } = useForm<ShareFormValues>({
    mode: "onBlur",
    resolver: zodResolver(ShareFormSchema),
    defaultValues: {
      transparentBackground: false,
      withRating: true,
      withOwnedPlatforms: true,
      withDivider: true,
    },
  });

  const shareMutation = useMutation({
    mutationFn: async (downloadOnly: boolean = false) => {
      const node = document.getElementById(GAME_INFO_SHARE_PREVIEW_ID);
      const blob = await toBlob(node!, {
        fetchRequestInit: {
          method: "GET",
          cache: "no-cache", // <-- Important!
        },
      });
      if (!blob) {
        throw new Error("Failed to generate final image.");
      }
      // The blob always has 'image/jpeg' as mimetype.
      const extension = "jpeg";
      const filename = `gamenode-${gameId}-${new Date().getTime()}.${extension}`;
      const file = new File([blob], filename, {
        type: blob.type,
      });

      if (downloadOnly) {
        return downloadFile(file);
      }

      await onShare(file);
    },
    onError: createErrorNotification,
  });

  const registerChip = (fieldName: FieldPath<ShareFormValues>) => {
    return {
      checked: watch(fieldName),
      onChange: (v: boolean) => setValue(fieldName, v),
    } as const;
  };

  return (
    <form
      className={"w-full h-full"}
      onSubmit={handleSubmit(() => {
        shareMutation.mutate(false);
      })}
    >
      <Stack w={"100%"} align={"center"}>
        {shareMutation.isError && (
          <Text c={"red"} className={"mt-2 mb-2 text-center"}>
            {shareMutation.error.message}
          </Text>
        )}

        <GameInfoSharePreview gameId={gameId} watchFormValues={watch} />

        <Group w={"100%"} className={"mt-4 mb-4"}>
          <Chip {...registerChip("withRating")}>Rating</Chip>
          <Chip {...registerChip("withOwnedPlatforms")}>Owned platforms</Chip>
          <Chip {...registerChip("withDivider")}>Divider</Chip>
          <Chip {...registerChip("transparentBackground")}>
            Transparent background
          </Chip>
        </Group>

        <Group className={"justify-end"} h={"fit-content"} gap={"0.5rem"}>
          <Button loading={shareMutation.isPending} type={"submit"}>
            Share
          </Button>
          <ActionIcon
            loading={shareMutation.isPending}
            onClick={() => {
              shareMutation.mutate(true);
            }}
            size={"lg"}
          >
            <IconDownload></IconDownload>
          </ActionIcon>
        </Group>
      </Stack>
    </form>
  );
};

export { GameInfoShare };
