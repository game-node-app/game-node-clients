// @vitest-environment jsdom
import React from "react";
import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@repo/locales";
import { Activity } from "@repo/wrapper/server";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../packages/ui/src/util";
import { ActivityItem } from "../../../../packages/ui/src/components/activity/item/ActivityItem";
import type { ActivityItemProps } from "../../../../packages/ui/src/components/activity/types";
import { XboxActivityItem } from "../../../../packages/ui/src/theme/themes/xbox/screens/XboxActivityItem";
import { setupDom } from "../components/mcp/testUtils";

vi.mock("../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
  },
}));

vi.mock(
  "../../../../packages/ui/src/components/activity/input/ActivityItemLikes",
  () => ({
    ActivityItemLikes: () => <span data-testid="activity-likes" />,
  }),
);

const LinkPresenter = ({ href, children, ...rest }: LinkComponentProps) => (
  <a href={href} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
    {children as ReactNode}
  </a>
);

const hooks = {
  useRouter: () => ({
    pathname: "/",
    back: vi.fn(),
    push: async () => {},
    query: new URLSearchParams(),
  }),
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider language="en">
    <MantineProvider>
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { retry: false, retryDelay: 0 } },
          })
        }
      >
        <UIProvider hooks={hooks} presenters={{ Link: LinkPresenter }}>
          {children}
        </UIProvider>
      </QueryClientProvider>
    </MantineProvider>
  </I18nProvider>
);

const baseActivity = (
  overrides: Partial<ActivityItemProps["activity"]> = {},
): ActivityItemProps["activity"] =>
  ({
    id: "activity-1",
    type: Activity.type.REVIEW,
    profileUserId: "user-1",
    profile: { username: "Tester", avatar: null },
    collectionEntry: null,
    collectionEntryId: null,
    collection: null,
    collectionId: null,
    review: { id: "review-1", gameId: 42, rating: 4 },
    reviewId: "review-1",
    userFollow: null,
    userFollowId: null,
    post: null,
    postId: null,
    obtainedGameAchievementActivity: null,
    obtainedGameAchievementActivityId: null,
    obtainedAchievement: null,
    obtainedAchievementId: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
    statisticsTarget: null,
    statisticsTargetId: null,
    game: {
      id: 42,
      name: "Game 42",
      cover: {
        url: "//images.igdb.com/igdb/image/upload/t_cover_big/co42.jpg",
      },
    },
    ...overrides,
  }) as unknown as ActivityItemProps["activity"];

const hrefs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("a")).map((link) =>
    link.getAttribute("href"),
  );

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("xbox activity item", () => {
  it("links to the same targets as the default activity item", () => {
    const activity = baseActivity();

    const defaultView = render(<ActivityItem activity={activity} />, {
      wrapper,
    });
    const xboxView = render(<XboxActivityItem activity={activity} />, {
      wrapper,
    });

    const defaultHrefs = hrefs(defaultView.container);
    const xboxHrefs = hrefs(xboxView.container);

    expect(xboxHrefs).toContain("/game/42?reviewId=review-1");
    expect(xboxHrefs).toContain("/profile/user-1");
    expect(new Set(xboxHrefs)).toEqual(new Set(defaultHrefs));
    expect(xboxView.container.textContent).toContain("Tester");
    expect(
      xboxView.container.querySelector("[data-xbox-activity]"),
    ).toBeTruthy();
    expect(
      xboxView.container.querySelector('[data-testid="activity-likes"]'),
    ).toBeTruthy();
  });

  it("keeps the plain game target for non-review activities", () => {
    const activity = baseActivity({
      type: Activity.type.COLLECTION_ENTRY,
      review: null,
      reviewId: null,
      collection: { id: "collection-1", name: "Wishlist" } as never,
    });

    const view = render(<XboxActivityItem activity={activity} />, { wrapper });
    const xboxHrefs = hrefs(view.container);

    expect(xboxHrefs).toContain("/game/42");
    expect(xboxHrefs.some((href) => href?.includes("reviewId"))).toBe(false);
    expect(view.container.textContent).toContain("Added to Wishlist");
  });

  it("keeps achievement rows readable with the badge and likes action", () => {
    const activity = baseActivity({
      type: Activity.type.ACHIEVEMENT_UNLOCKED,
      review: null,
      reviewId: null,
      game: undefined,
      obtainedAchievement: {
        tier: 2,
        achievementId: "achievement-1",
        definition: { name: "First Steps" },
      } as never,
    });

    const view = render(<XboxActivityItem activity={activity} />, { wrapper });

    expect(view.container.textContent).toContain("Unlocked First Steps tier 2");
    expect(view.container.textContent).toContain("Tester");
    expect(view.container.querySelector('a[href^="/game/"]')).toBeNull();
    expect(
      view.container.querySelector('[data-testid="activity-likes"]'),
    ).toBeTruthy();
  });

  it("keeps the profile link for activities without a game", () => {
    const activity = baseActivity({
      type: Activity.type.FOLLOW,
      game: undefined,
      review: null,
      reviewId: null,
    });
    const view = render(<XboxActivityItem activity={activity} />, { wrapper });

    expect(hrefs(view.container)).toEqual(["/profile/user-1"]);
    expect(view.container.textContent).toMatch(/followed/i);
  });

  it("keeps the card variant marker for grid feeds", () => {
    const view = render(
      <XboxActivityItem activity={baseActivity()} variant="card" />,
      { wrapper },
    );

    expect(
      view.container
        .querySelector("[data-xbox-activity]")
        ?.getAttribute("data-variant"),
    ).toBe("card");
  });
});
