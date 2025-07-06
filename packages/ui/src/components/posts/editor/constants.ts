import StarterKit from "@tiptap/starter-kit";
import { Link } from "@mantine/tiptap";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
// This import should be relative, otherwise hoisting fails
import { PostImage } from "./image/PostImage";

export const POST_EDITOR_EXTENSIONS = [
  StarterKit.configure(),
  Link,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Placeholder.configure({
    placeholder:
      "Write your post here. You can also paste or drag-and-drop images.",
  }),
  PostImage.configure(),
];

export const BLOG_POST_EDITOR_EXTENSIONS = [
  StarterKit,
  Link,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Placeholder.configure({
    placeholder:
      "Write your post here. You can also paste or drag-and-drop images.",
  }),
  PostImage.configure({
    HTMLAttributes: {
      imageProps: {
        className: "rounded-sm w-full",
      },
      wrapperProps: {
        className: "flex justify-center w-full",
      },
    },
  }),
];

export const POST_EDITOR_PUBLISH_MUTATION_KEY = ["post", "editor", "mutation"];
