import { describe, expect, it, vi } from "vitest";

vi.mock("@repo/ui", () => {
  const Icon = () => null;
  return {
    NavAchievementsIcon: Icon,
    NavActivityIcon: Icon,
    NavAiIcon: Icon,
    NavBlogIcon: Icon,
    NavCollectionsIcon: Icon,
    NavDailyIcon: Icon,
    NavExploreIcon: Icon,
    NavFeatsIcon: Icon,
    NavGuildIcon: Icon,
    NavHomeIcon: Icon,
    NavJournalIcon: Icon,
    NavLibraryIcon: Icon,
    NavPremiumIcon: Icon,
    NavUserIcon: Icon,
    NavWrappedIcon: Icon,
  };
});

import {
  buildDockGroups,
  type DockSeasonState,
} from "../../../../web/src/components/general/shell/navbar/dockGroups";
import { DOCK_GROUPS } from "../../../../web/src/components/general/shell/navbar/dockItems";

const emptySeason: DockSeasonState = {
  awardsEntry: null,
  awardsEvent: null,
  recapEntry: null,
  recapHref: null,
};

function findGuild(guildEarlyAccess: boolean) {
  const groups = buildDockGroups(emptySeason, {
    recapVisited: false,
    guildEarlyAccess,
  });

  for (const group of groups) {
    const item = group.items.find((candidate) => candidate.id === "guild");
    if (item) return item;
  }

  return undefined;
}

describe("Guild Dock entry early-access badge", () => {
  it("links to the Guild right after Daily", () => {
    const guild = findGuild(false);
    const discover = DOCK_GROUPS.find((group) => group.id === "discover");
    const ids = discover?.items.map((item) => item.id) ?? [];

    expect(guild?.kind).toBe("link");
    expect(guild?.labelKey).toBe("navigation.guild");
    expect(guild?.kind === "link" ? guild.href : undefined).toBe("/guild");
    expect(ids.indexOf("guild")).toBe(ids.indexOf("daily") + 1);
  });

  it("shows the early-access badge only in supporters mode", () => {
    expect(findGuild(true)?.badge).toBe("earlyAccess");
    expect(findGuild(false)?.badge).toBeUndefined();
  });

  it("does not mutate the static Dock item", () => {
    buildDockGroups(emptySeason, {
      recapVisited: false,
      guildEarlyAccess: true,
    });

    expect(findGuild(false)?.badge).toBeUndefined();
  });
});
