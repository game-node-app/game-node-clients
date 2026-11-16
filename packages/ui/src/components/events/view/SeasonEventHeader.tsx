import { useCurrentAwardsEvent } from "#@/components/awards/hooks/useCurrentAwardsEvent";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { getAwardsEntry } from "#@/components/events/util/seasonEvents";
import { useRouter } from "#@/util";
import { Breadcrumbs, Group, SegmentedControl, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

/** The season screens the header is used by. */
export type SeasonEventScreen = "recap" | "nominations" | "voting" | "results";

export interface SeasonEventHeaderProps {
  /** Year of the page; also the year of the Recap link. */
  year: number;
  screen: SeasonEventScreen;
}

const SCREEN_LABEL_KEYS = {
  recap: "events.header.screens.recap",
  nominations: "events.header.screens.nominations",
  voting: "events.header.screens.voting",
  results: "events.header.screens.results",
} as const;

type SeasonEventTarget = "recap" | "awards";

interface SeasonEventSegment {
  value: SeasonEventTarget;
  label: string;
  href: string;
}

/**
 * Breadcrumb "Eventos {ano} › {tela}" plus the "Retrospectiva | Awards"
 * selector shared by the Recap, nominations, ballot and results screens
 * (design §6).
 *
 * The Awards destination comes from `getAwardsEntry` for the page year, so it
 * follows the phase (and disappears outside the season). The Retrospectiva
 * destination needs the signed-in user and is hidden for visitors; when only
 * one destination exists the selector is not rendered at all.
 */
export function SeasonEventHeader({ year, screen }: SeasonEventHeaderProps) {
  const { t } = useTranslation();
  const userId = useUserId();
  const router = useRouter();
  const currentEventQuery = useCurrentAwardsEvent();

  const awardsEvent =
    currentEventQuery.data?.year === year ? currentEventQuery.data : null;
  const awardsEntry = getAwardsEntry(
    awardsEvent,
    undefined,
    undefined,
    new Date(),
  );

  const segments: SeasonEventSegment[] = [];

  if (userId) {
    segments.push({
      value: "recap",
      label: t("events.header.recap"),
      href: `/recap/${year}/${userId}`,
    });
  }

  if (awardsEntry) {
    segments.push({
      value: "awards",
      label: t("events.header.awards"),
      href: awardsEntry.href,
    });
  }

  return (
    <Group
      data-testid={"season-event-header"}
      justify={"space-between"}
      align={"center"}
      gap={"sm"}
      wrap={"wrap"}
      className={"w-full"}
    >
      <Breadcrumbs separator={"›"} separatorMargin={"xs"}>
        <Text size={"sm"} c={"dimmed"}>
          {t("events.header.breadcrumb", { year })}
        </Text>
        <Text size={"sm"} fw={600}>
          {t(SCREEN_LABEL_KEYS[screen])}
        </Text>
      </Breadcrumbs>
      {segments.length > 1 && (
        <SegmentedControl
          data-testid={"season-event-selector"}
          aria-label={t("events.header.navigationLabel")}
          size={"sm"}
          radius={"md"}
          className={"max-w-full"}
          value={screen === "recap" ? "recap" : "awards"}
          onChange={(value) => {
            const segment = segments.find((item) => item.value === value);
            if (!segment) return;
            router.push(segment.href).catch(console.error);
          }}
          data={segments.map(({ value, label }) => ({ value, label }))}
        />
      )}
    </Group>
  );
}
