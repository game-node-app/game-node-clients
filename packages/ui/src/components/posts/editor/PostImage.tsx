import React, { useState } from "react";
import { NodeViewWrapper, NodeP } from "@tiptap/react";

interface Props {
  node: Node;
}

const PostImage = ({ node }: Props) => {
  const [opened, setOpened] = useState(false);

  const handleImageClick = () => {
    setOpened(true);
  };

  return (
    <NodeViewWrapper className="relative inline-block">
      {/*<img*/}
      {/*  src={node.attrs.src}*/}
      {/*  alt={node.attrs.alt || ""}*/}
      {/*  title={node.attrs.title || ""}*/}
      {/*  className="cursor-pointer transition-transform duration-200 hover:scale-105"*/}
      {/*  onClick={handleImageClick}*/}
      {/*/>*/}
      {/*<ImageModal*/}
      {/*  opened={opened}*/}
      {/*  onClose={() => setOpened(false)}*/}
      {/*  src={node.attrs.src}*/}
      {/*/>*/}
    </NodeViewWrapper>
  );
};

export default PostImage;
