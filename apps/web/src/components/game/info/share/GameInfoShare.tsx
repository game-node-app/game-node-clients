import React, { useEffect, useRef, useState } from "react";
import {
    ActionIcon,
    Button,
    Checkbox,
    Chip,
    Group,
    Stack,
    Text,
} from "@mantine/core";
import { FieldPath, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    BaseModalChildrenProps,
    BaseModalProps,
} from "@/util/types/modal-props";
import GameInfoSharePreview, {
    GAME_INFO_SHARE_PREVIEW_ID,
} from "@/components/game/info/share/GameInfoSharePreview";
import { DetailsBox } from "@/components/general/DetailsBox";
import { toBlob } from "html-to-image";
import { useMutation } from "@tanstack/react-query";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { IconDownload } from "@tabler/icons-react";
import { useRouter } from "next/router";
import {
    EMatomoEventAction,
    EMatomoEventCategory,
    trackMatomoEvent,
} from "@/util/trackMatomoEvent";

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

const GameInfoShare = ({ gameId, onClose }: GameInfoShareProps) => {
    const canShare = navigator.canShare != undefined;
    const router = useRouter();

    const { watch, register, setValue, handleSubmit } =
        useForm<ShareFormValues>({
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

            if (!canShare) {
                console.error(
                    "User's browser doesn't support the WebShare API.",
                );
                throw new Error(
                    "Failed to generate final image: Browser not compatible.",
                );
            }

            const toShare: ShareData = {
                title: "GameNode Share",
                text: `See more at https://gamenode.app/game/${gameId}`,
                files: [file],
                url: `https://gamenode.app/game/${gameId}`,
            };
            try {
                if (navigator.canShare(toShare)) {
                    return await navigator.share(toShare);
                }
            } catch (e) {
                console.error(e);
            }

            throw new Error(
                "Failed to generate final image: Browser not compatible",
            );
        },

        onSuccess: () => {
            trackMatomoEvent(
                EMatomoEventCategory.Review,
                EMatomoEventAction.Share,
                "Shared generated review image with the game info share button",
            );
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
                {!canShare && (
                    <Text c={"red"} className={"mt-2 mb-2 text-center"}>
                        It seems like your browser doesn't support direct share.
                        You can still download the generated image.
                    </Text>
                )}
                {shareMutation.isError && (
                    <Text c={"red"} className={"mt-2 mb-2 text-center"}>
                        {shareMutation.error.message}
                    </Text>
                )}

                <GameInfoSharePreview gameId={gameId} watchFormValues={watch} />

                <Group w={"100%"} className={"mt-4 mb-4"}>
                    <Chip {...registerChip("withRating")}>Rating</Chip>
                    <Chip {...registerChip("withOwnedPlatforms")}>
                        Owned platforms
                    </Chip>
                    <Chip {...registerChip("withDivider")}>Divider</Chip>
                    <Chip {...registerChip("transparentBackground")}>
                        Transparent background
                    </Chip>
                </Group>

                <Group
                    className={"justify-end"}
                    h={"fit-content"}
                    gap={"0.5rem"}
                >
                    <Button
                        disabled={!canShare}
                        loading={shareMutation.isPending}
                        type={"submit"}
                    >
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
