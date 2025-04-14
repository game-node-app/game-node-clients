import React, { useMemo } from "react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Modal } from "#@/util";
import { useDisclosure } from "@mantine/hooks";
import { useOnMobilePlatform } from "#@/components";

const PostImageRenderer = ({
  node,
  editor,
  selected,
  extension,
}: NodeViewProps) => {
  const [opened, { open, close }] = useDisclosure();
  const onMobilePlatform = useOnMobilePlatform();

  const onImageClick = () => {
    if (!editor.isEditable) {
      open();
    }
  };

  const showRing = useMemo(
    () => selected && editor.isEditable,
    [editor.isEditable, selected],
  );

  const attributes = extension.options.HTMLAttributes;

  return (
    <NodeViewWrapper
      className={`relative inline-block ${showRing ? "ring-2 ring-brand-5 shadow-lg" : ""}`}
      {...attributes.wrapperProps}
    >
      <img
        {...attributes.imageProps}
        src={node.attrs.src}
        alt={node.attrs.alt || ""}
        title={node.attrs.title || ""}
        className={`post-image cursor-pointer transition-transform duration-200 h-auto max-w-full lg:hover:scale-[101%] ${attributes.imageProps?.className ?? ""}`}
        onClick={onImageClick}
      />
      <Modal
        opened={opened}
        onClose={close}
        size={"xl"}
        centered
        breakpoints={[0.75, 1]}
        initialBreakpoint={0.75}
        withCloseButton={!onMobilePlatform}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          title={node.attrs.title || ""}
          className={"w-full h-auto"}
        />
      </Modal>
    </NodeViewWrapper>
  );
};

export { PostImageRenderer };
