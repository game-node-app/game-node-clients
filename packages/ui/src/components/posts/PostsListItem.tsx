import {
  GameTitleWithFigure,
  ItemCommentsButton,
  ItemDropdown,
  ItemLikesButton,
  PostImageLightboxContext,
  useOnMobile,
  UserAvatarGroup,
} from "#@/components";
import { RelativeDate } from "#@/components/general/RelativeDate.tsx";
import { usePostsListItemData } from "#@/components/posts/usePostsListItemData.tsx";
import { buildPresenterComponent } from "#@/context";
import { Box, Divider, Group, Spoiler, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  FindAllCommentsDto,
  Post,
  StatisticsSourceRequestDto,
} from "@repo/wrapper/server";
import { EditorContent } from "@tiptap/react";

export interface PostsListItemProps {
  item: Post;
  withUserProfile?: boolean;
  withGameInfo?: boolean;
}

const DEFAULT_PostsListItem = ({
  item,
  withUserProfile = true,
  withGameInfo = true,
}: PostsListItemProps) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const { editor, isOwnPost, dialogs, toggleComments, openReport, openRemove } =
    usePostsListItemData(item);

  if (!editor) return null;

  return (
    <Group className={"w-full"} wrap={"nowrap"} align={"start"} gap={0}>
      {dialogs}

      <Box className={withUserProfile ? "hidden lg:block lg:w-2/12" : "hidden"}>
        <UserAvatarGroup
          avatarProps={{
            size: onMobile ? "lg" : "xl",
          }}
          userId={item.profileUserId}
          groupProps={{
            justify: "center",
          }}
          textProps={{
            display: onMobile ? "none" : undefined,
          }}
          withHorizontalBreak
        />
      </Box>

      <Stack
        className={
          "bg-paper mobile:bg-paper-2 w-full lg:lg:w-10/12 p-2 lg:p-4 flex-grow overflow-auto"
        }
      >
        <Group className={"w-full px-2 flex-nowrap"}>
          {onMobile ? (
            <Group className={"w-10/12 flex-nowrap"}>
              {withGameInfo && (
                <GameTitleWithFigure gameId={item.gameId} withTitle={false} />
              )}
              <Box className={withUserProfile ? "max-w-fit" : "hidden"}>
                <UserAvatarGroup userId={item.profileUserId} />
              </Box>
            </Group>
          ) : (
            <Group className={"w-10/12"}>
              {withGameInfo && <GameTitleWithFigure gameId={item.gameId} />}
            </Group>
          )}

          <Box className={"ms-auto"}>
            <ItemDropdown>
              <ItemDropdown.ReportButton
                onClick={openReport}
                disabled={isOwnPost}
              />
              {isOwnPost && <ItemDropdown.RemoveButton onClick={openRemove} />}
            </ItemDropdown>
          </Box>
        </Group>
        <Divider className={"w-full"} />
        <Spoiler
          hideLabel={t("actions.showLess")}
          showLabel={t("actions.showMore")}
          maxHeight={300}
        >
          <PostImageLightboxContext>
            <EditorContent editor={editor} />
          </PostImageLightboxContext>
        </Spoiler>
        <Group className={"w-full flex-nowrap"}>
          <RelativeDate
            date={item.createdAt}
            c={"dimmed"}
            fz={"sm"}
            className={"me-auto"}
          />
          <ItemCommentsButton
            onClick={toggleComments}
            sourceId={item.id}
            sourceType={FindAllCommentsDto.sourceType.POST}
          />
          <ItemLikesButton
            sourceId={item.id}
            sourceType={StatisticsSourceRequestDto.sourceType.POST}
          />
        </Group>
      </Stack>
    </Group>
  );
};

const PostsListItem = buildPresenterComponent(
  "PostsListItem",
  DEFAULT_PostsListItem,
);

export { PostsListItem };
