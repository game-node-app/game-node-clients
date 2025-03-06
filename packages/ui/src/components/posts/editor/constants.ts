import StarterKit from "@tiptap/starter-kit";
import { Link } from "@mantine/tiptap";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

export const POST_EDITOR_EXTENSIONS = [
  StarterKit,
  Link,
  Image.configure({
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
