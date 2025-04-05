import StarterKit from "@tiptap/starter-kit";
import { Link } from "@mantine/tiptap";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { PostImage } from "#@/components";

export const POST_EDITOR_EXTENSIONS = [
  StarterKit,
  Link,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  PostImage.configure(),
  Placeholder.configure({
    placeholder:
      "Write your post here. You can also paste or drag-and-drop images.",
  }),
];

export const BLOG_POST_EDITOR_EXTENSIONS = POST_EDITOR_EXTENSIONS.concat([]);

export const POST_EDITOR_PUBLISH_MUTATION_KEY = ["post", "editor", "mutation"];
