import { ReactNodeViewRenderer } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import { PostImageRenderer } from "#@/components";

const PostImage = Image.extend({
  name: "image",
  addNodeView() {
    return ReactNodeViewRenderer(PostImageRenderer);
  },
});

export { PostImage };
