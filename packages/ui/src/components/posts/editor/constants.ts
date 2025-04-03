import StarterKit from "@tiptap/starter-kit";
import { Link } from "@mantine/tiptap";
import Placeholder from "@tiptap/extension-placeholder";
import { PostImage } from "#@/components";

export const POST_EDITOR_EXTENSIONS = [
  StarterKit,
  Link,
  PostImage.configure({
    HTMLAttributes: {
      class: "post-image",
    },
  }),
  Placeholder.configure({
    placeholder:
      "Write your post here. You can also paste or drag-and-drop images.",
  }),
];

export const POST_EDITOR_PUBLISH_MUTATION_KEY = ["post", "editor", "mutation"];
