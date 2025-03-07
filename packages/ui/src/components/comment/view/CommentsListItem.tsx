import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { COMMENT_EDITOR_EXTENSIONS } from "#@/components/comment/editor/CommentEditor";
import { Collapse, Flex, Group, Spoiler, Stack } from "@mantine/core";
import { UserAvatarGroup } from "#@/components/general/avatar/UserAvatarGroup";
import { CommentsListItemActions } from "#@/components/comment/view/CommentsListItemActions";
import { UserComment } from "../types";
import { CommentsThreadListView } from "#@/components/comment/view/CommentsThreadListView";
import { useDisclosure } from "@mantine/hooks";
import { RelativeDate } from "#@/components/general/RelativeDate.tsx";

interface Props {
  comment: UserComment;
  onEditStart: (commentId: string) => void;
}

const CommentsListItem = ({ comment, onEditStart }: Props) => {
  const [isReadMore, setIsReadMore] = useState(false);

  const nonEditableEditor = useEditor(
    {
      extensions: COMMENT_EDITOR_EXTENSIONS,
      editable: false,
      content: comment?.content,
      immediatelyRender: window != undefined,
    },
    [comment],
  );

  const [commentThreadOpened, commentThreadUtils] = useDisclosure();

  if (!nonEditableEditor) return;

  return (
    <Stack className={"w-full h-full"}>
      <Group w={"100%"} justify={"space-evenly"} wrap={"wrap"}>
        <Group className={"w-full flex-nowrap justify-between"}>
          <Flex
            justify={{
              base: "space-between",
              lg: "start",
            }}
            align={{
              base: "center",
              lg: "start",
            }}
          >
            <UserAvatarGroup
              avatarProps={{
                size: "md",
              }}
              userId={comment.profileUserId}
              groupProps={{
                gap: "md",
              }}
            />
          </Flex>

          <RelativeDate c={"dimmed"} fz={"sm"} date={comment.createdAt} />
        </Group>

        <Stack className={"w-full"}>
          <Spoiler
            hideLabel={"Show less"}
            showLabel={"Show more"}
            expanded={isReadMore}
            onExpandedChange={setIsReadMore}
            maxHeight={250}
          >
            <EditorContent editor={nonEditableEditor} className={"w-full"} />
          </Spoiler>
        </Stack>
        <Stack className={"w-full"}>
          <CommentsListItemActions
            comment={comment}
            onEditStart={onEditStart}
            onCommentThreadClick={commentThreadUtils.toggle}
          />
        </Stack>
      </Group>
      <Collapse
        in={commentThreadOpened}
        className={"flex w-full justify-end"}
        transitionDuration={100}
      >
        <Stack className={"w-full h-full"}>
          <CommentsThreadListView comment={comment} />
        </Stack>
      </Collapse>
    </Stack>
  );
};

export { CommentsListItem };
