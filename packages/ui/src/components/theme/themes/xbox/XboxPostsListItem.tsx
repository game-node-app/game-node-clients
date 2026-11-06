import {
  ItemCommentsButton,
  ItemDropdown,
  ItemLikesButton,
  PostImageLightboxContext,
  PostsListItemProps,
  UserAvatar,
  useUserProfile,
} from "#@/components";
import { useGame } from "#@/components/game/hooks/useGame";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { RelativeDate } from "#@/components/general/RelativeDate.tsx";
import { usePostsListItemData } from "#@/components/posts/usePostsListItemData.tsx";
import { useUserLevel } from "#@/components/user-level/hooks/useUserLevel";
import { Link } from "#@/util";
import { ActionIcon, Spoiler } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import {
  FindAllCommentsDto,
  StatisticsSourceRequestDto,
} from "@repo/wrapper/server";
import { IconShare3 } from "@tabler/icons-react";
import { EditorContent } from "@tiptap/react";

/** Xbox feed post: author and game on top, the content, then comment/like/share; styled in xbox/theme.css. */
const XboxPostsListItem = ({
  item,
  withUserProfile = true,
  withGameInfo = true,
}: PostsListItemProps) => {
  const { t } = useTranslation();
  const clipboard = useClipboard();
  const { editor, isOwnPost, dialogs, toggleComments, openReport, openRemove } =
    usePostsListItemData(item);
  const profileQuery = useUserProfile(item.profileUserId);
  const levelQuery = useUserLevel(item.profileUserId);
  const gameQuery = useGame(withGameInfo ? item.gameId : undefined, {
    relations: { cover: true },
  });

  const share = async () => {
    const url = `${window.location.origin}/posts?postId=${item.id}`;
    if (navigator.share) {
      // closing the share sheet rejects; there is nothing to report
      await navigator.share({ url }).catch(() => undefined);
      return;
    }
    clipboard.copy(url);
    notifications.show({
      color: "green",
      message: t("posts.messages.linkCopied"),
    });
  };

  if (!editor) return null;

  const profileHref = `/profile/${item.profileUserId}`;
  const hasImage = /<img\s/i.test(item.content);

  return (
    <article className={"gn-feed-post"}>
      {dialogs}
      <header className={"gn-feed-post-head"}>
        {withUserProfile && (
          <>
            <Link href={profileHref} className={"gn-feed-post-avatar"}>
              <UserAvatar userId={item.profileUserId} size={44} />
            </Link>
            <div className={"gn-feed-post-author"}>
              <Link href={profileHref} className={"gn-feed-post-user"}>
                {profileQuery.data?.username}
              </Link>
              {levelQuery.data && (
                <span className={"gn-feed-post-level"}>
                  {t("user.labels.level", {
                    level: levelQuery.data.currentLevel,
                  })}
                </span>
              )}
            </div>
          </>
        )}
        <RelativeDate date={item.createdAt} className={"gn-feed-post-date"} />
        <ItemDropdown>
          <ItemDropdown.ReportButton
            onClick={openReport}
            disabled={isOwnPost}
          />
          {isOwnPost && <ItemDropdown.RemoveButton onClick={openRemove} />}
        </ItemDropdown>
      </header>

      {withGameInfo && (
        <Link href={`/game/${item.gameId}`} className={"gn-feed-post-game"}>
          <img
            src={
              getSizedImageUrl(
                getCoverUrl(gameQuery.data),
                ImageSize.COVER_SMALL_2X,
              ) ?? "/img/game_placeholder.jpeg"
            }
            alt={""}
            loading={"lazy"}
          />
          <span className={"gn-feed-post-game-text"}>
            <span className={"gn-feed-post-action"}>
              {hasImage
                ? t("posts.labels.sharedImage")
                : t("posts.labels.postedAbout")}
            </span>
            <span className={"gn-feed-post-game-name"}>
              {gameQuery.data?.name}
            </span>
          </span>
        </Link>
      )}

      <Spoiler
        className={"gn-feed-post-content"}
        hideLabel={t("actions.showLess")}
        showLabel={t("actions.showMore")}
        maxHeight={480}
      >
        <PostImageLightboxContext>
          <EditorContent editor={editor} />
        </PostImageLightboxContext>
      </Spoiler>

      <footer className={"gn-feed-post-actions"}>
        <ItemCommentsButton
          onClick={toggleComments}
          sourceId={item.id}
          sourceType={FindAllCommentsDto.sourceType.POST}
        />
        <ItemLikesButton
          sourceId={item.id}
          sourceType={StatisticsSourceRequestDto.sourceType.POST}
        />
        <ActionIcon
          variant={"subtle"}
          color={"gray"}
          onClick={share}
          aria-label={t("actions.share")}
        >
          <IconShare3 size={18} />
        </ActionIcon>
      </footer>
    </article>
  );
};

export { XboxPostsListItem };
