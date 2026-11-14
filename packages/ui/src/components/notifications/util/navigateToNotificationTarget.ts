import { ReviewsService } from "@repo/wrapper/server";
import type { NotificationInboxItemDto } from "@repo/wrapper/server";
import type { RouterHookProps } from "#@/util/link";

export type NotificationNavigationRouter = Pick<RouterHookProps, "push">;

/**
 * Navigates to the typed target of a notification.
 *
 * This is the navigation previously performed by the legacy aggregated
 * notification item, extracted without behavior changes: review targets are
 * resolved through `ReviewsService` on click so the user lands on the review's
 * game page.
 */
export async function navigateToNotificationTarget(
  target: NotificationInboxItemDto["target"],
  router: NotificationNavigationRouter,
  userId?: string | null,
): Promise<void> {
  if (!target) return;

  if (target.type === "review") {
    try {
      const review = await ReviewsService.reviewsControllerFindOneByIdV1(
        target.id,
      );
      if (review?.gameId) {
        await router.push(
          `/game/${review.gameId}?tab=reviews&reviewId=${review.id}`,
        );
      }
    } catch (err) {
      console.error(err);
    }
    return;
  }

  if (target.type === "post") {
    await router.push(`/posts?postId=${target.id}`);
  } else if (target.type === "activity") {
    await router.push(`/activity/detail/${target.id}`);
  } else if (target.type === "profile") {
    await router.push(`/profile/${target.id}`);
  } else if (target.type === "importer") {
    await router.push(`/importer/${target.provider}`);
  } else if (target.type === "connection") {
    await router.push("/preferences/connections");
  } else if (target.type === "achievement" && userId) {
    await router.push(`/feats/${userId}`);
  }
}
