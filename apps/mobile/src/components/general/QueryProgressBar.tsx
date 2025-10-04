import React from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { IonProgressBar } from "@ionic/react";

/**
 * Renders a Progress bar whenever a query is fetching or a mutation is in progress.
 * @constructor
 * @see @tanstack/react-query
 */
const QueryProgressBar = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  if (!isFetching && !isMutating) {
    return null;
  }

  return <IonProgressBar type={"indeterminate"} />;
};

export { QueryProgressBar };
