import React, { useCallback, useState } from "react";
import { Stack, Tabs } from "@mantine/core";
import { ActivityFeed, InfiniteLoaderChildren } from "#@/components";
import { PostsFeed } from "#@/components/posts/feed/PostsFeed.tsx";

type HomeFeedTab = "posts" | "activity";

interface Props {
  children: InfiniteLoaderChildren;
}

/**
 * Component that renders infinite scrolling content. Usually used at home page.
 * @constructor
 */
const HomeFeed = ({ children }: Props) => {
  const [currentTab, setCurrentTab] = useState<HomeFeedTab>("posts");

  const renderFeed = useCallback(() => {
    switch (currentTab) {
      case "activity":
        return <ActivityFeed criteria={"all"}>{children}</ActivityFeed>;
      case "posts":
        return <PostsFeed criteria={"all"}>{children}</PostsFeed>;
    }
  }, [children, currentTab]);

  return (
    <Stack className={"w-full h-full"}>
      <Tabs value={currentTab}>
        <Tabs.List grow>
          <Tabs.Tab
            value={"posts"}
            onClick={() => {
              setCurrentTab("posts");
            }}
          >
            Posts
          </Tabs.Tab>
          <Tabs.Tab
            value={"activity"}
            onClick={() => {
              setCurrentTab("activity");
            }}
          >
            Activity
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      {renderFeed()}
    </Stack>
  );
};

export { HomeFeed };
