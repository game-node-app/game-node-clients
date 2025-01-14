import React, { PropsWithChildren, useState } from "react";
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { Flex, Group, rem, Stack, Text } from "@mantine/core";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { FileError } from "react-dropzone-esm";

const ImageDropzone = ({
    maxSize,
    maxFiles,
    ...props
}: PropsWithChildren<DropzoneProps>) => {
    const [errors, setErrors] = useState<FileError[] | undefined>(undefined);
    return (
        <Dropzone
            className={"w-full h-full"}
            accept={IMAGE_MIME_TYPE}
            onReject={(rejections) => {
                setErrors(rejections.flatMap((rejection) => rejection.errors));
            }}
            {...props}
        >
            <Group
                justify="center"
                gap="xl"
                mih={220}
                style={{ pointerEvents: "none" }}
            >
                <Dropzone.Accept>
                    <IconUpload
                        style={{
                            width: rem(52),
                            height: rem(52),
                            color: "var(--mantine-color-blue-6)",
                        }}
                        stroke={1.5}
                    />
                </Dropzone.Accept>
                <Dropzone.Reject>
                    <IconX
                        style={{
                            width: rem(52),
                            height: rem(52),
                            color: "var(--mantine-color-red-6)",
                        }}
                        stroke={1.5}
                    />
                </Dropzone.Reject>
                <Dropzone.Idle>
                    <IconPhoto
                        style={{
                            width: rem(52),
                            height: rem(52),
                            color: "var(--mantine-color-dimmed)",
                        }}
                        stroke={1.5}
                    />
                </Dropzone.Idle>
                <Stack justify={"center"}>
                    <Text size="xl" inline>
                        Drag images here or click to select files
                    </Text>
                    <Group gap={10}>
                        {maxFiles && <Text>Max files: {maxFiles}</Text>}
                        {maxSize && (
                            <Text>
                                Max size: {(maxSize / 1000 ** 2).toFixed(2)}MB
                            </Text>
                        )}
                    </Group>

                    {errors?.map((err, i) => {
                        return (
                            <Text key={i} c={"red"}>
                                {err.code}: {err.message}
                            </Text>
                        );
                    })}
                    {props.children}
                </Stack>
            </Group>
        </Dropzone>
    );
};

export default ImageDropzone;
