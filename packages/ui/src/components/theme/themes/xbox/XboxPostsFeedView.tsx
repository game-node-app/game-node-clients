import {
  GamePostEditor,
  InfiniteLoaderProps,
  PostsFeed,
  PostsFeedTabValue,
  PostsFeedViewProps,
  SimpleInfiniteLoader,
  useUserId,
} from "#@/components";
import { useBlogPosts } from "#@/components/blog/hooks/useBlogPosts";
import { TrendingGamesList } from "#@/components/game/trending/TrendingGamesList";
import { ConsoleBlogItem } from "#@/components/theme/console/ConsoleBlogSection";
import { Drawer, Tabs, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";

const SIGNED_IN_TABS: PostsFeedTabValue[] = ["all", "following", "mine"];

/** Xbox feed: pill tabs over the posts, trending games and blog on the side, a + button to post; styled in xbox/theme.css. */
const XboxPostsFeedView = ({ targetedPostId }: PostsFeedViewProps) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const [currentTab, setCurrentTab] = useState<PostsFeedTabValue>("all");
  const [composerOpened, composerUtils] = useDisclosure();
  const blogPosts = useBlogPosts({ limit: 4 });

  const tabLabels: Record<PostsFeedTabValue, string> = {
    all: t("activity.tabs.all"),
    following: t("activity.tabs.following"),
    mine: t("posts.tabs.mine"),
  };
  const tabs = userId ? SIGNED_IN_TABS : (["all"] as PostsFeedTabValue[]);

  return (
    <div className={"gn-feed"}>
      <header className={"gn-feed-head"}>
        <h1 className={"gn-section-title"}>{t("navigation.feed")}</h1>
        {tabs.length > 1 && (
          <Tabs
            unstyled
            value={currentTab}
            onChange={(value) =>
              value && setCurrentTab(value as PostsFeedTabValue)
            }
          >
            <Tabs.List className={"gn-profile-tabs"}>
              {tabs.map((value) => (
                <Tabs.Tab
                  key={value}
                  value={value}
                  className={"gn-profile-tab"}
                >
                  {tabLabels[value]}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        )}
      </header>

      <div className={"gn-feed-body"}>
        <div className={"gn-feed-main"}>
          <PostsFeed
            criteria={currentTab}
            targetedPostId={targetedPostId}
            withEditor={false}
          >
            {(props: InfiniteLoaderProps) => (
              <SimpleInfiniteLoader {...props} />
            )}
          </PostsFeed>
        </div>

        <aside className={"gn-feed-aside"}>
          <TrendingGamesList cols={3} />
          {blogPosts.data && blogPosts.data.data.length > 0 && (
            <section className={"gn-feed-aside-section"}>
              <h2 className={"gn-section-title"}>{t("navigation.blog")}</h2>
              {blogPosts.data.data.map((post) => (
                <ConsoleBlogItem key={post.id} post={post} />
              ))}
            </section>
          )}
        </aside>
      </div>

      {userId && (
        <>
          <UnstyledButton
            className={"gn-feed-fab"}
            onClick={composerUtils.open}
            aria-label={t("posts.titles.create")}
          >
            <IconPlus size={28} />
          </UnstyledButton>
          <Drawer
            opened={composerOpened}
            onClose={composerUtils.close}
            position={"right"}
            size={"lg"}
            title={t("posts.titles.create")}
            classNames={{ content: "gn-console-aside gn-console-aside-end" }}
          >
            <GamePostEditor onPublish={composerUtils.close} />
          </Drawer>
        </>
      )}
    </div>
  );
};

export { XboxPostsFeedView };
