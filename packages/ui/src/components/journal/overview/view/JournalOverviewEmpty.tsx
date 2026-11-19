import { buildPresenterComponent } from "#@/context";

export interface JournalOverviewEmptyProps {
  userId: string;
}

/**
 * Shown when the journal overview has no entries. Renders nothing by default;
 * apps can register a presenter to show an empty state.
 */
const JournalOverviewEmpty = buildPresenterComponent(
  "JournalOverviewEmpty",
  () => null,
);

export { JournalOverviewEmpty };
