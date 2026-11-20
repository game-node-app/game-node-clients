import { ItemCommentsButton } from "#@/components/comment/input/ItemCommentsButton";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { RelativeDate } from "#@/components/general/RelativeDate";
import { ItemDropdown } from "#@/components/general/input/ItemDropdown/ItemDropdown";
import { useGame } from "#@/components/game/hooks/useGame";
import {
  GAME_COVER_PLACEHOLDER,
  useGameCoverImage,
} from "#@/components/game/hooks/useGameCoverImage";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { usePostsListItemActions } from "#@/components/posts/hooks/usePostsListItemActions";
import { PostImageLightboxContext } from "#@/components/posts/editor/image/PostImageLightboxContext";
import type { PostsListItemProps } from "#@/components/posts/PostsListItem";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { ItemLikesButton } from "#@/components/statistics/input/ItemLikesButton";
import { useUserLevel } from "#@/components/user-level/hooks/useUserLevel";
import { useShareText } from "#@/context/UIProvider";
import { Link } from "#@/util/link";
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
import classes from "./XboxPostsListItem.module.css";

/**
 * Xbox feed post: author and game on top, the content, then comment/like/share.
 *
 * Every action comes from `usePostsListItemActions`, the same hook the default
 * `PostsListItem` uses: the read-only editor, report form, own-post removal,
 * comment modal (the app's injected modal) and post cache invalidation. The
 * only addition is the share action the Xbox feed shows.
 */
const XboxPostsListItem = ({
  item,
  withUserProfile = true,
  withGameInfo = true,
}: PostsListItemProps) => {
  const { t } = useTranslation();
  const clipboard = useClipboard();
  const shareText = useShareText();
  const { editor, isOwnPost, dialogs, openComments, openReport, openRemove } =
    usePostsListItemActions(item);
  const profileQuery = useUserProfile(item.profileUserId);
  const levelQuery = useUserLevel(item.profileUserId);
  const gameQuery = useGame(withGameInfo ? item.gameId : undefined, {
    relations: { cover: true },
  });
  const cover = useGameCoverImage(gameQuery.data, ImageSize.COVER_SMALL_2X);

  if (!editor) return null;

  const share = async () => {
    const url = `https://gamenode.app/posts?postId=${encodeURIComponent(item.id)}`;
    try {
      // The platform adapter (native share sheet on mobile) throws when
      // sharing is unavailable, and resolves to false when it was dismissed.
      await shareText(url);
    } catch {
      clipboard.copy(url);
      notifications.show({
        color: "green",
        message: t("posts.messages.linkCopied"),
      });
    }
  };

  const profileHref = `/profile/${item.profileUserId}`;
  const hasImage = /<img\s/i.test(item.content);

  return (
    <article className={classes.post} data-testid={"xbox-post"}>
      {dialogs}

      <header className={classes.postHead}>
        {withUserProfile && (
          <>
            <Link
              href={profileHref}
              className={classes.avatarLink}
              aria-label={profileQuery.data?.username}
            >
              <UserAvatar userId={item.profileUserId} size={44} />
            </Link>
            <div className={classes.author}>
              <Link href={profileHref} className={classes.user}>
                {profileQuery.data?.username}
              </Link>
              {levelQuery.data && (
                <span className={classes.level}>
                  {t("user.labels.level", {
                    level: levelQuery.data.currentLevel,
                  })}
                </span>
              )}
            </div>
          </>
        )}
        <RelativeDate date={item.createdAt} className={classes.date} />
        <ItemDropdown>
          <ItemDropdown.ReportButton
            onClick={openReport}
            disabled={isOwnPost}
          />
          {isOwnPost && <ItemDropdown.RemoveButton onClick={openRemove} />}
        </ItemDropdown>
      </header>

      {withGameInfo && (
        <Link href={`/game/${item.gameId}`} className={classes.gameLink}>
          <img
            src={cover.src ?? GAME_COVER_PLACEHOLDER}
            alt={""}
            loading={"lazy"}
            onError={cover.onError}
            className={classes.gameCover}
          />
          <span className={classes.gameText}>
            <span className={classes.gameAction}>
              {hasImage
                ? t("posts.labels.sharedImage")
                : t("posts.labels.postedAbout")}
            </span>
            <span className={classes.gameName}>{gameQuery.data?.name}</span>
          </span>
        </Link>
      )}

      <Spoiler
        className={classes.content}
        hideLabel={t("actions.showLess")}
        showLabel={t("actions.showMore")}
        maxHeight={480}
      >
        <PostImageLightboxContext>
          <EditorContent editor={editor} />
        </PostImageLightboxContext>
      </Spoiler>

      <footer className={classes.actions}>
        <ItemCommentsButton
          onClick={openComments}
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
          onClick={() => void share()}
          aria-label={t("actions.share")}
          data-testid={"xbox-post-share"}
        >
          <IconShare3 size={18} />
        </ActionIcon>
      </footer>
    </article>
  );
};

export { XboxPostsListItem };
