import { Group, rem, Stack, Text } from "@mantine/core";
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { PropsWithChildren, useState } from "react";
import type {
  Accept,
  FileError,
  FileRejection,
  FileWithPath,
} from "react-dropzone";

type Props = Omit<PropsWithChildren<DropzoneProps>, "accept"> & {
  /**
   * MIME -> extensions map (or plain MIME list). Defaults to every image MIME
   * type. Video flows pass a map because Matroska files often have no MIME.
   */
  accept?: Accept | string[];
  /** Already-localized prompt for the idle state. */
  prompt?: string;
};

const getAcceptedFormats = (accept: Accept | string[]): string[] => {
  if (Array.isArray(accept)) {
    return Array.from(
      new Set(accept.map((mimeType) => mimeType.split("/")[1] ?? mimeType)),
    ).map((format) => format.toUpperCase());
  }

  const extensions = Object.values(accept)
    .flat()
    .map((extension) => extension.replace(/^\./, "").toUpperCase());

  if (extensions.length > 0) {
    return Array.from(new Set(extensions));
  }

  return Array.from(
    new Set(
      Object.keys(accept)
        .filter(Boolean)
        .map((mimeType) => mimeType.split("/")[1] ?? mimeType),
    ),
  ).map((format) => format.toUpperCase());
};

const sizeInMb = (bytes: number) => (bytes / 1024 ** 2).toFixed(2);

const ImageDropzone = ({
  maxSize,
  maxFiles,
  accept = IMAGE_MIME_TYPE,
  prompt,
  children,
  onDrop,
  onReject,
  ...props
}: Props) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<FileError[] | undefined>(undefined);

  const handleDrop = (files: FileWithPath[]) => {
    setErrors(undefined);
    onDrop(files);
  };

  const handleReject = (rejections: FileRejection[]) => {
    setErrors(rejections.flatMap((rejection) => rejection.errors));
    onReject?.(rejections);
  };

  const renderError = (error: FileError, index: number) => {
    switch (error.code) {
      case "file-invalid-type":
        return (
          <Text key={index} c={"red"}>
            {t("upload.messages.rejectedType", {
              formats: getAcceptedFormats(accept).join(", "),
            })}
          </Text>
        );
      case "file-too-large":
        return (
          <Text key={index} c={"red"}>
            {t("upload.messages.rejectedTooLarge", {
              size: sizeInMb(maxSize ?? 0),
            })}
          </Text>
        );
      case "file-too-small":
        return (
          <Text key={index} c={"red"}>
            {t("upload.messages.rejectedTooSmall")}
          </Text>
        );
      case "too-many-files":
        return (
          <Text key={index} c={"red"}>
            {t("upload.messages.rejectedTooManyFiles", {
              max: maxFiles ?? 1,
            })}
          </Text>
        );
      default:
        return (
          <Text key={index} c={"red"}>
            {t("upload.messages.rejectedUnknown")}
          </Text>
        );
    }
  };

  const uniqueErrors = errors
    ? Array.from(new Map(errors.map((error) => [error.code, error])).values())
    : undefined;

  return (
    <Dropzone
      className={"w-full h-full"}
      accept={accept}
      maxSize={maxSize}
      maxFiles={maxFiles}
      onDrop={handleDrop}
      onReject={handleReject}
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
            {prompt ?? t("upload.dragPrompt")}
          </Text>
          <Group gap={10}>
            {maxFiles != undefined && (
              <Text>
                {t("upload.labels.maxFiles", {
                  max: maxFiles,
                })}
              </Text>
            )}
            {maxSize != undefined && (
              <Text>
                {t("upload.labels.maxSize", {
                  size: sizeInMb(maxSize),
                })}
              </Text>
            )}
          </Group>

          {uniqueErrors?.map(renderError)}
          {children}
        </Stack>
      </Group>
    </Dropzone>
  );
};

export { ImageDropzone };
