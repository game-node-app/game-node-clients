import React, { useState } from "react";
import { ActionIcon, Button, Chip, Group, Stack, Text } from "@mantine/core";
import { FieldPath, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseModalChildrenProps } from "@/util/types/modal-props";
import GameInfoSharePreview, { GAME_INFO_SHARE_PREVIEW_ID } from "@/components/game/info/share/GameInfoSharePreview";
import { toBlob } from "html-to-image";
import { useMutation } from "@tanstack/react-query";
import { IconDownload } from "@tabler/icons-react";
import { Share } from "@capacitor/share";
import { blobToBase64 } from "@/util/imageUtils";
import { Filesystem, Directory } from "@capacitor/filesystem";

interface GameInfoShareProps extends BaseModalChildrenProps {
    gameId: number;
}

const ShareFormSchema = z.object({
    withRating: z.boolean().default(true),
    withOwnedPlatforms: z.boolean().default(true),
    transparentBackground: z.boolean().default(false),
    withDivider: z.boolean().default(true),
});

export type ShareFormValues = z.infer<typeof ShareFormSchema>;

function downloadFile(file: File) {
    const objectURL = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.download = file.name;
    link.href = objectURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectURL);
}

const GameInfoShare = ({ gameId }: GameInfoShareProps) => {
    const [errorText, setErrorText] = useState("");
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
            const blob = await toBlob(node!);
            if (!blob) {
                throw new Error("Failed to generate final image.");
            }
            // The blob always has 'image/jpeg' has mimetype.
            const extension = "jpeg";
            const filename = `gamenode-${gameId}.${extension}`;
            const file = new File([blob], filename, {
                type: blob.type,
            });

            if (downloadOnly) {
                return downloadFile(file);
            }

            const base64 = await blobToBase64(file);
            console.log("file: ", file);
            console.log("base64: ", base64);
            try {
                const cachedFileResult = await Filesystem.writeFile({
                    path: file.name,
                    data: base64,
                    directory: Directory.Cache,
                });

                const canShare = await Share.canShare();
                console.log("canShare: ", canShare);

                await Share.share({
                    title: "My review of this game",
                    dialogTitle: "Share your review with friends!",
                    url: cachedFileResult.uri,
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                console.error(e);
                setErrorText(e?.message || "");
            }

            throw new Error("Failed to generate final image: not compatible");
        },
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
                <Text c={"red"} className={"mt-2 mb-2 text-center"}>
                    {errorText}
                </Text>
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
                    <Chip {...registerChip("transparentBackground")}>Transparent background</Chip>
                </Group>

                <Group className={"justify-end"} h={"fit-content"} gap={"0.5rem"}>
                    <Button disabled={false} loading={shareMutation.isPending} type={"submit"}>
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

export default GameInfoShare;
