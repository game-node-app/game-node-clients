import { IonProgressBar } from "@ionic/react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useDelayedLoadingIndicator } from "@/components/general/hooks/useDelayedLoadingIndicator";

interface Props {
  /**
   * @see useDelayedLoadingIndicator
   */
  showDelayMs?: number;
  /**
   * @see useDelayedLoadingIndicator
   */
  minVisibleMs?: number;
}

/**
 * Renders a Progress bar whenever a query is loading data that isn't on screen
 * yet or a mutation is in progress.
 *
 * Background refetches (polling, `refetchOnMount` with cached data) are ignored,
 * so the bar doesn't blink every few seconds. Fast requests never show it at
 * all. It is absolutely positioned at the bottom of the header on purpose: it
 * must not take part in the layout, otherwise showing it would push the page
 * content down.
 * @constructor
 * @see @tanstack/react-query
 */
const QueryProgressBar = ({ showDelayMs, minVisibleMs }: Props) => {
  // Only the very first attempt of a query is loading something the user
  // cannot see. Background refetches, retries and reloads of queries that
  // already failed are silent: `errorUpdateCount` marks a query that failed
  // before, even though a new fetch resets `status` back to "pending".
  const isFetching = useIsFetching({
    predicate: (query) =>
      query.state.status === "pending" &&
      query.state.fetchFailureCount === 0 &&
      query.state.errorUpdateCount === 0,
  });
  const isMutating = useIsMutating();
  const isVisible = useDelayedLoadingIndicator(
    isFetching > 0 || isMutating > 0,
    { showDelayMs, minVisibleMs },
  );

  return (
    <div className={"pointer-events-none absolute inset-x-0 bottom-0 z-10"}>
      {isVisible && <IonProgressBar type={"indeterminate"} />}
    </div>
  );
};

export { QueryProgressBar };
