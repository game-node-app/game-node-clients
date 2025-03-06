import React, { useState } from "react";
import { Box, Divider, Group, Spoiler, Stack } from "@mantine/core";
import {
  FindAllCommentsDto,
  FindOneStatisticsDto,
  Post,
} from "@repo/wrapper/server";
import { EditorContent, useEditor } from "@tiptap/react";
import { POST_EDITOR_EXTENSIONS } from "#@/components/posts/editor/constants.ts";
import {
  CommentEditorView,
  CommentsListView,
  GameTitleWithFigure,
  ItemCommentsButton,
  ItemLikesButton,
  useOnMobile,
  UserAvatarGroup,
} from "#@/components";
import { RelativeDate } from "#@/components/general/RelativeDate.tsx";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "#@/util";

interface Props {
  item: Post;
}

const PostsListItem = ({ item }: Props) => {
  const onMobile = useOnMobile();

  const [commentsOpened, commentsOpenedUtils] = useDisclosure();
  const [repliedCommentId, setRepliedCommentId] = useState<string | undefined>(
    undefined,
  );

  const editor = useEditor(
    {
      extensions: POST_EDITOR_EXTENSIONS,
      immediatelyRender: window != undefined,
      content: item.content,
      editable: false,
    },
    [item.content],
  );

  if (!editor) return null;

  return (
    <Group className={"w-full"} wrap={"nowrap"} align={"start"}>
      <Modal
        title={"Comments in this post"}
        opened={commentsOpened}
        onClose={commentsOpenedUtils.close}
        fullScreen={onMobile}
        size={"xl"}
        initialBreakpoint={0.5}
        breakpoints={[0.5, 0.75, 0.85, 1]}
      >
        <Stack className={"w-full h-full"}>
          <CommentsListView
            sourceId={item.id}
            sourceType={FindAllCommentsDto.sourceType.POST}
            onReplyClicked={setRepliedCommentId}
          />
          <CommentEditorView
            sourceId={item.id}
            sourceType={FindAllCommentsDto.sourceType.POST}
            onEditEnd={() => setRepliedCommentId(undefined)}
            childOf={repliedCommentId}
          />
        </Stack>
      </Modal>
      {!onMobile && (
        <Box className={"lg:w-2/12"}>
          <UserAvatarGroup
            avatarProps={{
              size: "xl",
            }}
            userId={item.profileUserId}
            groupProps={{
              justify: "center",
            }}
            withHorizontalBreak={!onMobile}
          />
        </Box>
      )}
      <Stack
        className={
          "bg-[#161616] w-full lg:lg:w-10/12 p-2 lg:p-4 flex-grow overflow-auto"
        }
      >
        <Stack className={"w-full px-2"}>
          {onMobile ? (
            <Group className={"flex-nowrap"}>
              <GameTitleWithFigure gameId={item.gameId} withTitle={false} />
              <UserAvatarGroup userId={item.profileUserId} />
            </Group>
          ) : (
            <Group className={"max-w-fit"}>
              <GameTitleWithFigure gameId={item.gameId} />
            </Group>
          )}
        </Stack>
        <Divider className={"w-full"} />
        <Spoiler
          hideLabel={"Show less"}
          showLabel={"Show more"}
          maxHeight={300}
        >
          <EditorContent editor={editor} />
        </Spoiler>
        <Group className={"w-full flex-nowrap"}>
          <RelativeDate
            date={item.createdAt}
            c={"dimmed"}
            fz={"sm"}
            className={"me-auto"}
          />
          <ItemCommentsButton
            onClick={() => {
              commentsOpenedUtils.toggle();
            }}
            sourceId={item.id}
            sourceType={FindAllCommentsDto.sourceType.POST}
          />
          <ItemLikesButton
            targetUserId={item.profileUserId}
            sourceId={item.id}
            sourceType={FindOneStatisticsDto.sourceType.POST}
          />
        </Group>
      </Stack>
    </Group>
  );
};

export { PostsListItem };
