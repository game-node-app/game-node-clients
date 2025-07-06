import React, { useEffect, useMemo } from "react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { usePostImageLightboxContext } from "#@/components";

const PostImageRenderer = ({
  node,
  editor,
  selected,
  extension,
}: NodeViewProps) => {
  const { registerImage, unregisterImage, openLightbox } =
    usePostImageLightboxContext();

  const onImageClick = () => {
    if (!editor.isEditable) {
      openLightbox(node.attrs.src);
    }
  };

  const showRing = useMemo(
    () => selected && editor.isEditable,
    [editor.isEditable, selected],
  );

  const attributes = extension.options.HTMLAttributes;

  useEffect(() => {
    registerImage(node.attrs.src);

    return () => {
      unregisterImage(node.attrs.src);
    };
    // Do not add more dependencies here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.attrs.src]);

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
    </NodeViewWrapper>
  );
};

export { PostImageRenderer };
