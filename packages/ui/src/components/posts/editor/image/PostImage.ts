import { ReactNodeViewRenderer } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import { PostImageRenderer } from "#@/components";

const PostImage = Image.extend({
  name: "image",
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-id"),
        renderHTML: (attributes) =>
          attributes.id ? { "data-id": attributes.id } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(PostImageRenderer);
  },
});

export { PostImage };
