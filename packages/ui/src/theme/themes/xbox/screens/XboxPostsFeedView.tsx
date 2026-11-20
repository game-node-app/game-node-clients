import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useBlogPosts } from "#@/components/blog/hooks/useBlogPosts";
import { TrendingGamesList } from "#@/components/game/trending/TrendingGamesList";
import { GamePostEditor } from "#@/components/posts/editor/GamePostEditor";
import { PostsFeed } from "#@/components/posts/feed/PostsFeed";
import { PostsFeedTabValue } from "#@/components/posts/feed/PostsFeedLayout";
import { PostsFeedViewProps } from "#@/components/posts/feed/PostsFeedView";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { ConsoleBlogItem } from "#@/theme/experiences/console/ConsoleBlogSection";
import { Modal } from "#@/util/modal";
import { Tabs, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconPlus } from "@tabler/icons-react";
import pillClasses from "./XboxProfileViewNavbarItem.module.css";
import classes from "./XboxPostsFeedView.module.css";

const FEED_TABS: {
  value: PostsFeedTabValue;
  labelKey: "activity.tabs.all" | "activity.tabs.following";
  disabled?: boolean;
}[] = [
  { value: "all", labelKey: "activity.tabs.all" },
  // same scope the default layout exposes today: following is not available yet
  { value: "following", labelKey: "activity.tabs.following", disabled: true },
];

/**
 * Xbox posts feed: pill tabs over the posts, trending games and blog in a side
 * column on wide screens, and a round button that opens the post editor.
 *
 * The data, pagination slot (`children`) and tab scopes come from the default
 * `PostsFeed`/`PostsFeedView`; the inline editor is disabled there and opened
 * here through the app's injected modal. Signed-out users keep reading the feed
 * but get no create button.
 */
const XboxPostsFeedView = ({
  currentTab,
  onTabChange,
  targetedPostId,
  children,
}: PostsFeedViewProps) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const onMobile = useOnMobile();
  const [composerOpened, composerUtils] = useDisclosure();
  const blogPosts = useBlogPosts({ limit: 4 });
  const visibleBlogPosts = blogPosts.data?.data.slice(0, 4) ?? [];

  return (
    <div className={classes.feed}>
      <header className={classes.head}>
        <h1 className={classes.title}>{t("navigation.posts")}</h1>
        <Tabs
          unstyled
          value={currentTab}
          onChange={(value) => {
            if (value) {
              onTabChange(value as PostsFeedTabValue);
            }
          }}
        >
          <Tabs.List className={pillClasses.list}>
            {FEED_TABS.map(({ value, labelKey, disabled }) => (
              <Tabs.Tab
                key={value}
                value={value}
                disabled={disabled}
                className={pillClasses.tab}
              >
                {t(labelKey)}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      </header>

      <div className={classes.body}>
        <div className={classes.main}>
          <PostsFeed
            criteria={currentTab}
            targetedPostId={targetedPostId}
            withEditor={false}
          >
            {children}
          </PostsFeed>
        </div>

        <aside className={classes.aside}>
          <TrendingGamesList cols={3} />
          {visibleBlogPosts.length > 0 && (
            <section className={classes.asideSection}>
              <h2 className={classes.asideTitle}>{t("navigation.blog")}</h2>
              {visibleBlogPosts.map((post) => (
                <ConsoleBlogItem key={post.id} post={post} />
              ))}
            </section>
          )}
        </aside>
      </div>

      {userId && (
        <>
          <UnstyledButton
            className={classes.fab}
            onClick={composerUtils.open}
            aria-label={t("posts.titles.create")}
            data-testid={"xbox-feed-create"}
          >
            <IconPlus size={28} aria-hidden />
          </UnstyledButton>
          <Modal
            opened={composerOpened}
            onClose={composerUtils.close}
            title={t("posts.titles.create")}
            fullScreen={onMobile}
            size={"lg"}
          >
            <GamePostEditor
              onPublish={() => {
                composerUtils.close();
              }}
            />
          </Modal>
        </>
      )}
    </div>
  );
};

export { XboxPostsFeedView };
