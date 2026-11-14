import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  NotificationAchievementTargetDto,
  NotificationConnectionTargetDto,
  NotificationContentTargetDto,
  NotificationInboxItemDto,
  ReviewsService,
} from "@repo/wrapper/server";
import { navigateToNotificationTarget } from "../../../../../packages/ui/src/components/notifications/util/navigateToNotificationTarget";

type Target = NotificationInboxItemDto["target"];

function createRouter() {
  return {
    push: vi.fn().mockResolvedValue(undefined),
  };
}

describe("navigateToNotificationTarget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["post", "/posts?postId=post-456", { type: "post", id: "post-456" }],
    [
      "activity",
      "/activity/detail/act-789",
      { type: "activity", id: "act-789" },
    ],
    ["profile", "/profile/user-101", { type: "profile", id: "user-101" }],
    [
      "importer",
      "/importer/steam",
      { type: "importer", id: "imp-1", provider: "steam" },
    ],
    [
      "connection",
      "/preferences/connections",
      {
        type: NotificationConnectionTargetDto.type.CONNECTION,
        id: "7",
        provider: NotificationConnectionTargetDto.provider.STEAM,
      },
    ],
  ])("navigates directly for %s targets", async (_, expectedRoute, target) => {
    const router = createRouter();

    await navigateToNotificationTarget(
      target as unknown as Target,
      router,
      "user-1",
    );

    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith(expectedRoute);
  });

  it("opens the own achievements page for achievement targets", async () => {
    const router = createRouter();

    await navigateToNotificationTarget(
      {
        type: NotificationAchievementTargetDto.type.ACHIEVEMENT,
        id: "horror-critic",
        tier: 2,
      },
      router,
      "user-1",
    );

    expect(router.push).toHaveBeenCalledWith("/feats/user-1");
  });

  it("does not navigate to achievements without a user id", async () => {
    const router = createRouter();

    await navigateToNotificationTarget(
      {
        type: NotificationAchievementTargetDto.type.ACHIEVEMENT,
        id: "horror-critic",
        tier: 2,
      },
      router,
    );

    expect(router.push).not.toHaveBeenCalled();
  });

  it("resolves review targets to the game reviews page", async () => {
    const reviewSpy = vi
      .spyOn(ReviewsService, "reviewsControllerFindOneByIdV1")
      .mockResolvedValue({
        id: "rev-333",
        gameId: 777,
      } as unknown as import("@repo/wrapper/server").Review);

    const router = createRouter();

    await navigateToNotificationTarget(
      {
        type: NotificationContentTargetDto.type.REVIEW,
        id: "rev-333",
      },
      router,
      "user-1",
    );

    expect(reviewSpy).toHaveBeenCalledWith("rev-333");
    expect(router.push).toHaveBeenCalledWith(
      "/game/777?tab=reviews&reviewId=rev-333",
    );
  });

  it("does not navigate when the review has no game", async () => {
    vi.spyOn(
      ReviewsService,
      "reviewsControllerFindOneByIdV1",
    ).mockResolvedValue({
      id: "rev-333",
      gameId: null,
    } as unknown as import("@repo/wrapper/server").Review);

    const router = createRouter();

    await navigateToNotificationTarget(
      { type: NotificationContentTargetDto.type.REVIEW, id: "rev-333" },
      router,
    );

    expect(router.push).not.toHaveBeenCalled();
  });

  it("logs and stops when resolving the review fails", async () => {
    const error = new Error("not found");
    vi.spyOn(
      ReviewsService,
      "reviewsControllerFindOneByIdV1",
    ).mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const router = createRouter();

    await expect(
      navigateToNotificationTarget(
        { type: NotificationContentTargetDto.type.REVIEW, id: "rev-333" },
        router,
      ),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(router.push).not.toHaveBeenCalled();
  });

  it("does nothing for a missing target", async () => {
    const reviewSpy = vi.spyOn(
      ReviewsService,
      "reviewsControllerFindOneByIdV1",
    );
    const router = createRouter();

    await navigateToNotificationTarget(null, router, "user-1");

    expect(router.push).not.toHaveBeenCalled();
    expect(reviewSpy).not.toHaveBeenCalled();
  });
});
